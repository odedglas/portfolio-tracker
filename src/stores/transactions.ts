import { uniq } from 'lodash';
import { defineStore } from 'pinia';
import transactionsAPI from 'src/service/transactions';
import * as stocksAPI from 'src/service/stocks';
import type { Quote } from 'src/service/stocks';
import { usePortfolioStore } from './portfolios';
import { Transaction } from 'src/types';

let loadedOnce = false;

export const useTransactionsStore = defineStore('transactions', {
  state: (): {
    transactions: Transaction[];
    tickerQuotes: Record<string, Quote>;
  } => ({
    transactions: [],
    tickerQuotes: {},
  }),
  getters: {
    balanceMap: (state) => {
      const transactions = [...state.transactions];
      debugger;
      return transactions.reduce((balanceMap, transaction) => {
        let balance = 0;
        const transactionValue =
          transaction.shares * transaction.price + (transaction.fees || 0);

        if (transaction.action === 'buy') {
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
              (t) => t.action === 'buy' && t.ticker === transaction.ticker
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

            const transactionConst =
              buyTransaction.price * availableSharesToSell -
              (buyTransaction.fees ?? 0);
            balance -= transactionConst;

            soldShares -= buyTransaction.shares;
            iterator++;
          }
        }

        balanceMap[transaction.id] = balance;

        return balanceMap;
      }, {} as Record<string, number>);
    },
    summary: (state) => {
      return state.transactions.reduce(
        (summary, transaction) => {
          const transactionValue = transaction.shares * transaction.price;

          summary[transaction.action] += transactionValue;
          summary.fees += transaction.fees || 0;

          return summary;
        },
        { buy: 0, sell: 0, fees: 0 }
      );
    },
  },
  actions: {
    async list() {
      const { selectedPortfolioId } = usePortfolioStore();

      if (!selectedPortfolioId) {
        throw Error('Cannot list transactions without Portfolio id');
      }

      if (loadedOnce) {
        return this.transactions;
      }

      const transactions = await transactionsAPI.list(selectedPortfolioId);

      const tickers = uniq(
        transactions.map((transaction) => transaction.ticker)
      );

      const quotes = await stocksAPI.getQuotes(tickers);
      quotes.quoteResponse.result.forEach((quote) => {
        this.tickerQuotes[quote.symbol] = quote;
      });

      this.transactions = transactions;

      loadedOnce = true;

      return this.transactions;
    },
    remove(transactionId: string) {
      this.transactions = this.transactions.filter(
        (transaction) => transaction.id !== transactionId
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
