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

export const viewTransformer = {
  initialDeposit(portfolio: Portfolio) {
    return portfolio.deposits.find((deposit) => deposit.initial)?.value ?? 0;
  },
  depositsValue(portfolio: Portfolio) {
    return portfolio.deposits
      .filter((d) => d.type !== 'balance')
      .reduce((amount, deposit) => amount + deposit.value, 0);
  },
  depositManualBalance(portfolio: Portfolio) {
    return portfolio.deposits
      .filter((d) => d.type === 'balance')
      .reduce((amount, deposit) => amount + deposit.value, 0);
  },
  cashFlow(portfolio: Portfolio) {
    return (
      viewTransformer.depositsValue(portfolio) -
      portfolio.invested -
      (portfolio.fees ?? 0) +
      viewTransformer.depositManualBalance(portfolio)
    );
  },
  portfolioKPIS(portfolio: Portfolio) {
    const depositsValue = viewTransformer.depositsValue(portfolio);
    const cashFlow = viewTransformer.cashFlow(portfolio);

    const target = {
      value: portfolio.target,
      percentage: (portfolio.currentValue + cashFlow) / portfolio.target,
    };

    const profit = {
      value: portfolio.profit,
      percentage: portfolio.invested ? portfolio.profit / depositsValue : 0,
    };

    const dailyChange = {
      value: portfolio.dailyChange ?? 0,
      percentage: portfolio.dailyChange
        ? portfolio.dailyChange / depositsValue
        : 0,
    };

    return { target, profit, dailyChange };
  },
};

export default api;
