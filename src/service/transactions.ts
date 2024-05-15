import { Transaction } from 'src/types';
import {
  getCollections,
  firestoreAPI,
  queries,
} from 'src/service/firebase/collections';

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
      console.log('Handle create transaction');
      transactionId = 'create';
    } else {
      console.log('Handle update transaction');
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

export default api;
