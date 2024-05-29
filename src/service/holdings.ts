import { Holding } from 'src/types';
import {
  getCollections,
  firestoreAPI,
  queries,
} from 'src/service/firebase/collections';

const holdingsCollection = () => getCollections().holding;

const api = {
  list: async (portfolioId: string) =>
    queries.getPortfolioHoldings(portfolioId),
  get: async (holdingId: string) =>
    firestoreAPI.getDocument(holdingsCollection(), holdingId),
  update: async (
    data: Partial<Holding>,
    holdingId?: string
  ): Promise<Holding> => {
    if (!data.portfolioId) {
      throw new Error(
        'Cannot update/create a transaction without a valid portfolio id'
      );
    }

    if (!holdingId) {
      data.createdAt = Date.now();
      delete data.id;

      const result = await firestoreAPI.addDocument(holdingsCollection(), data);

      holdingId = result.id;
    } else {
      await firestoreAPI.updateDocument(holdingId, holdingsCollection(), data);
    }

    return await api.get(holdingId);
  },
  delete: async (holdingId: string) =>
    firestoreAPI.deleteDocument(holdingId, holdingsCollection()),
};

export default api;
