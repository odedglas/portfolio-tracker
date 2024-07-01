import { defineStore } from 'pinia';
import transactionsAPI, { transformer } from 'src/service/transactions';
import { Transaction } from 'app/shared/types';
import { useQuotesStore } from 'stores/quotes';

interface TransactionsStoreState {
  transactions: Transaction[];
  loading: boolean;
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionsStoreState => ({
    transactions: [],
    loading: false,
  }),
  getters: {
    balanceMap: (state) => {
      const quotesStore = useQuotesStore();
      const transactions = [...state.transactions].reverse();

      return transactions.reduce((balanceMap, transaction) => {
        let balance = 0;
        const transactionValue = transformer.actualValue(transaction);

        // Buy balance would be calculated by transaction value VS ticker last price from quote.
        // Sell balance would be transaction realized profit / loss
        if (transformer.isBuy(transaction)) {
          const lastTickerValue = quotesStore.tickerQuotes[transaction.ticker];

          if (lastTickerValue) {
            const currentPrice =
              transaction.actualShares * lastTickerValue.regularMarketPrice;
            balance = currentPrice - transactionValue;
          }
        } else {
          balance = transaction.realizedProfit || 0;
        }

        balanceMap[transaction.id] = balance;

        return balanceMap;
      }, {} as Record<string, number>);
    },
    summary: (state) => transformer.summary(state.transactions),
    actualShares: (state) =>
      state.transactions.reduce((shares, transaction) => {
        if (!transformer.isBuy(transaction)) {
          return shares;
        }

        return shares + transaction.actualShares;
      }, 0),
  },
  actions: {
    async list(portfolioId: string) {
      this.loading = true;

      if (!portfolioId) {
        throw Error('Cannot list transactions without Portfolio id');
      }

      const transactions = await transactionsAPI.list(portfolioId);
      if (!transactions.length) {
        this.loading = false;
        this.transactions = [];
        return this.transactions;
      }

      this.transactions = transactions;

      this.loading = false;

      return this.transactions;
    },
    async remove(transaction: Transaction) {
      // DE - Allocate sell transactions to available buy transactions
      if (!transformer.isBuy(transaction)) {
        const affectedTransaction = transactionsAPI.allocateSellTransaction(
          transaction,
          this.transactions,
          false
        );

        affectedTransaction.forEach(this.update);
      }

      await transactionsAPI.delete(transaction);

      this.transactions = this.transactions.filter(
        (t) => t.id !== transaction.id
      );
    },
    async add(transaction: Transaction) {
      // Allocate sell transactions to available buy transactions
      if (!transformer.isBuy(transaction)) {
        const affectedTransaction = transactionsAPI.allocateSellTransaction(
          transaction,
          this.transactions
        );

        affectedTransaction.forEach(this.update);
      }

      transaction = await transactionsAPI.update(transaction);

      this.transactions = [...this.transactions, transaction].sort((t1, t2) =>
        t1.date < t2.date ? 1 : -1
      );
    },
    async update(transaction: Transaction) {
      const updateIndex = this.transactions.findIndex(
        (current) => current.id === transaction.id
      );

      const existing = this.transactions[updateIndex];
      if (existing && !transformer.isBuy(existing)) {
        transaction.realizedProfit =
          (existing.realizedProfit ?? 0) +
          (transaction.price - existing.price) * transaction.actualShares;
      }

      await transactionsAPI.update(transaction, transaction.id);

      this.transactions[updateIndex] = transaction;
    },
  },
});
