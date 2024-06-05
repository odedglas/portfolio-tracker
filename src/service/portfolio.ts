import { Portfolio } from 'src/types';
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

      data.deposits = [
        { date: Date.now(), value: data.currentValue || 0, initial: true },
      ];

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
  delete: async (portfolioId: string) =>
    firestoreAPI.deleteDocument(portfolioId, portfolioCollection()),
};

export const viewTransformer = {
  depositsValue(portfolio: Portfolio) {
    return portfolio.deposits.reduce(
      (amount, deposit) => amount + deposit.value,
      0
    );
  },
  cashFlow(portfolio: Portfolio) {
    return viewTransformer.depositsValue(portfolio) - portfolio.invested;
  },
  portfolioKPIS(portfolio: Portfolio) {
    const target = {
      value: portfolio.target,
      percentage: portfolio.currentValue / portfolio.target,
    };

    const profit = {
      value: portfolio.profit,
      percentage: portfolio.invested
        ? portfolio.profit / portfolio.invested
        : portfolio.invested,
    };

    return { target, profit };
  },
};

export default api;
