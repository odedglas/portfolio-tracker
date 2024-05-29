import { uniq } from 'lodash';
import { defineStore } from 'pinia';
import transactionsAPI, { transformer } from 'src/service/transactions';
import * as stocksAPI from 'src/service/stocks';
import type { Quote } from 'src/service/stocks';
import { Transaction } from 'src/types';

interface TransactionsStoreState {
  transactions: Transaction[];
  tickerQuotes: Record<string, Quote>;
  loading: boolean;
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionsStoreState => ({
    transactions: [],
    tickerQuotes: {},
    loading: false,
  }),
  getters: {
    balanceMap: (state) => {
      const transactions = [...state.transactions].sort((t1, t2) =>
        t1.date < t2.date ? 1 : -1
      );

      return transactions.reduce((balanceMap, transaction) => {
        let balance = 0;
        const transactionValue = transformer.totalValue(transaction);

        if (transformer.isBuy(transaction)) {
          // Buy balance would be calculated by transaction value VS ticker last price from quote.
          const lastTickerValue = state.tickerQuotes[transaction.ticker];

          if (lastTickerValue) {
            const currentPrice =
              transaction.shares * lastTickerValue.regularMarketPrice;
            balance = currentPrice - transactionValue;
          }
        } else {
          // Sell balance would be calculated by BUY type transactions FIFO style
          const buyTransactions = state.transactions
            .filter(
              (t) => transformer.isBuy(t) && t.ticker === transaction.ticker
            )
            .reverse();

          // For each buy transaction, we should cover if sell action covered it's shares or not and calculate the balance relatively
          balance = transactionValue;
          let soldShares = transaction.shares;
          let iterator = 0;
          while (soldShares > 0 && buyTransactions.length > 0) {
            const buyTransaction = buyTransactions[iterator];
            const availableSharesToSell = Math.min(
              buyTransaction.shares,
              soldShares
            );

            const transactionCost =
              buyTransaction.price * availableSharesToSell -
              (buyTransaction.fees ?? 0);
            balance -= transactionCost;

            soldShares -= buyTransaction.shares;
            iterator++;
          }
        }

        balanceMap[transaction.id] = balance;

        return balanceMap;
      }, {} as Record<string, number>);
    },
    summary: (state) => {
      console.log(transformer.summary(state.transactions));
      return transformer.summary(state.transactions);
    },
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

      const tickers = uniq(
        transactions.map((transaction) => transaction.ticker)
      );

      const quotes = await stocksAPI.getQuotes(tickers);
      quotes.quoteResponse.result.forEach((quote) => {
        this.tickerQuotes[quote.symbol] = quote;
      });

      this.transactions = transactions;

      this.loading = false;

      return this.transactions;
    },
    remove(transaction: Transaction) {
      this.transactions = this.transactions.filter(
        (t) => t.id !== transaction.id
      );
    },
    add(transaction: Transaction) {
      this.transactions = [...this.transactions, transaction].sort((t1, t2) =>
        t1.date < t2.date ? 1 : -1
      );
    },
    update(transaction: Transaction) {
      const index = this.transactions.findIndex(
        (current) => current.id === transaction.id
      );

      this.transactions[index] = transaction;
    },
  },
});
