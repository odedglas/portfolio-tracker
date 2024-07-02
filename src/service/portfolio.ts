import { Portfolio } from 'app/shared/types';
import {
  getCollections,
  firestoreAPI,
  queries,
} from 'src/service/firebase/collections';
import { authentication } from 'src/service/firebase/authentication';

const portfolioCollection = () => getCollections().portfolio;

const api = {
  list: queries.listUserPortfolios,
  get: async (portfolioId: string) =>
    firestoreAPI.getDocument(portfolioCollection(), portfolioId),
  update: async (
    data: Partial<Portfolio>,
    portfolioId?: string
  ): Promise<Portfolio> => {
    if (!data.title) {
      throw new Error('Cannot update/create a portfolio without a valid title');
    }

    if (!portfolioId) {
      data.createdAt = Date.now();
      data.owner = authentication.currentUser.uid;

      const result = await firestoreAPI.addDocument(
        portfolioCollection(),
        data
      );

      portfolioId = result.id;
    } else {
      await firestoreAPI.updateDocument(
        portfolioId,
        portfolioCollection(),
        data
      );
    }

    return await api.get(portfolioId);
  },
  // TODO - Deletion should clean all portfolio related entities such as Transactions / Holdings.
  delete: async (portfolioId: string) =>
    firestoreAPI.deleteDocument(portfolioId, portfolioCollection()),
};

export default api;
