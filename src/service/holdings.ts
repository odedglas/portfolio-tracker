import { Holding } from 'src/types';
import {
  getCollections,
  firestoreAPI,
  queries,
} from 'src/service/firebase/collections';

const holdingsCollection = () => getCollections().holding;

const api = {
  get: async (portfolioId: string) => queries.getPortfolioHoldings(portfolioId),
  update: async (
    data: Partial<Holding>,
    holdingId?: string
  ): Promise<Holding[]> => {
    if (!data.portfolioId) {
      throw new Error(
        'Cannot update/create a transaction without a valid portfolio id'
      );
    }

    if (!holdingId) {
      data.createdAt = Date.now();
      delete data.id;

      await firestoreAPI.addDocument(holdingsCollection(), data);
    } else {
      await firestoreAPI.updateDocument(holdingId, holdingsCollection(), data);
    }

    return await api.get(data.portfolioId);
  },
  delete: async (holdingId: string) =>
    firestoreAPI.deleteDocument(holdingId, holdingsCollection()),
};

export default api;
