import { defineStore } from 'pinia';
import transactionsAPI from 'src/service/transactions';
import { usePortfolioStore } from './portfolios';
import { Transaction } from 'src/types';

let loadedOnce = false;

export const useTransactionsStore = defineStore('transactions', {
  state: (): {
    transactions: Transaction[];
  } => ({
    transactions: [],
  }),
  actions: {
    async list() {
      const { selectedPortfolioId } = usePortfolioStore();

      if (!selectedPortfolioId) {
        throw Error('Cannot list transactions without Portfolio id');
      }

      if (loadedOnce) {
        return this.transactions;
      }

      this.transactions = await transactionsAPI.list(selectedPortfolioId);

      loadedOnce = true;

      return this.transactions;
    },
    remove(transactionId: string) {
      this.transactions = this.transactions.filter(
        (transaction) => transaction.id !== transactionId
      );
    },
    add(transaction: Transaction) {
      this.transactions.push(transaction);
    },
    update(transaction: Transaction) {
      const index = this.transactions.findIndex(
        (current) => current.id === transaction.id
      );

      this.transactions[index] = transaction;
    },
  },
});
