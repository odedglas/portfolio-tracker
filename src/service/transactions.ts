import { Transaction } from 'src/types';
import {
  getCollections,
  firestoreAPI,
  queries,
} from 'src/service/firebase/collections';
import { TRANSACTIONS_TYPES } from 'src/constants';

const transactionsCollection = () => getCollections().transaction;

const api = {
  list: queries.listPortfolioTransactions,
  get: async (transactionId: string) =>
    firestoreAPI.getDocument(transactionsCollection(), transactionId),
  update: async (
    data: Partial<Transaction>,
    transactionId?: string
  ): Promise<Transaction> => {
    if (!data.portfolioId) {
      throw new Error(
        'Cannot update/create a transaction without a valid portfolio id'
      );
    }

    if (!transactionId) {
      data.createdAt = Date.now();

      const result = await firestoreAPI.addDocument(
        transactionsCollection(),
        data
      );

      transactionId = result.id;
    } else {
      await firestoreAPI.updateDocument(
        transactionId,
        transactionsCollection(),
        data
      );
    }

    return await api.get(transactionId);
  },
  delete: async (transactionId: string) =>
    firestoreAPI.deleteDocument(transactionId, transactionsCollection()),
};

export const transformer = {
  isBuy: (transaction: Transaction) =>
    transaction.action === TRANSACTIONS_TYPES.BUY,
  summary: (transactions: Transaction[]) =>
    transactions.reduce(
      (summary, transaction) => {
        const transactionValue = transaction.shares * transaction.price;

        summary[transaction.action] += transactionValue;
        summary.fees += transaction.fees || 0;

        return summary;
      },
      { buy: 0, sell: 0, fees: 0 }
    ),
  totalValue: (transaction: Transaction) =>
    transaction.shares * transaction.price + (transaction.fees || 0),
};

export default api;
