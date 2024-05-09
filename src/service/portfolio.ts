import { Portfolio } from 'src/types';
import { collections, firestoreAPI } from 'src/service/firebase/collections';
import { authentication } from 'src/service/firebase/authentication';

const api = {
  all: () => firestoreAPI.getAll(collections.portfolio),
  get: async (portfolioId: string) =>
    firestoreAPI.getDocument(collections.portfolio, portfolioId),
  update: async (
    data: Partial<Portfolio>,
    portfolioId?: string
  ): Promise<Portfolio> => {
    const isNew = !!portfolioId;
    if (!data.title) {
      throw new Error('Cannot update/create a portfolio without a valid title');
    }

    portfolioId = portfolioId || data.title.toLowerCase().split(' ').join('-');

    if (isNew) {
      data.createdAt = Date.now();
      data.owner = authentication.currentUser.uid;
      data.deposits = [
        { date: Date.now(), value: data.currentValue || 0, initial: true },
      ];

      data.id = portfolioId;
    }

    await firestoreAPI.updateDocument(portfolioId, collections.portfolio, data);

    return await api.get(portfolioId);
  },
  delete: async (portfolioId: string) =>
    firestoreAPI.deleteDocument(portfolioId, collections.portfolio),
};

export const viewTransformer = {
  cashFlow(portfolio: Portfolio) {
    return (
      portfolio.deposits.reduce(
        (amount, deposit) => amount + deposit.value,
        0
      ) - portfolio.invested
    );
  },
  portfolioKPIS(portfolio: Portfolio) {
    const profitValue = portfolio.currentValue - portfolio.invested;

    const target = {
      value: portfolio.target,
      percentage: portfolio.currentValue / portfolio.target,
    };

    const profit = {
      value: profitValue,
      percentage: portfolio.invested
        ? profitValue / portfolio.invested
        : portfolio.invested,
      profitable: profitValue >= 0,
    };

    return { target, profit };
  },
};

export default api;
