import { Holding, Transaction } from 'shared/types';
import { transactionsTransformer } from 'app/shared/transformers';
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

  syncHoldingWithTransactions: async (
    holding: Holding,
    transactions: Transaction[]
  ) => {
    debugger;
    const holdingTransactions = transactions.filter(
      (t) => t.ticker === holding.ticker
    );

    const buyTransactions = holdingTransactions.filter(
      transactionsTransformer.isBuy
    );

    // Total and Average price are calculated by current Buy transactions
    const totalShares = buyTransactions.reduce(
      (acc, t) => acc + t.actualShares,
      0
    );

    // Fees included
    holding.avgPrice = totalShares
      ? (buyTransactions.reduce(
          (acc, t) => acc + transactionsTransformer.actualValue(t),
          0
        ) ?? 0) / totalShares
      : 0;

    // Calculate invested by transactions funds (original shares), Fees included
    holding.invested = holdingTransactions.reduce(
      (acc, t) =>
        acc +
        transactionsTransformer.totalValue(t) *
          (transactionsTransformer.isBuy(t) ? 1 : -1),
      0
    );

    // Fees and profits would be calculated by the whole set.
    holding.fees = holdingTransactions.reduce(
      (acc, t) => acc + (t.fees ?? 0),
      0
    );

    holding.realizedProfits = holdingTransactions.reduce(
      (acc, t) => acc + (t.realizedProfit ?? 0),
      0
    );

    return await api.update(holding, holding.id);
  },
};

export default api;
