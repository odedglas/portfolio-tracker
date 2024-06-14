import { Holding, HoldingWithProfits, Transaction } from 'src/types';
import {
  getCollections,
  firestoreAPI,
  queries,
} from 'src/service/firebase/collections';
import { transformer as transactionTransformer } from 'src/service/transactions';
import { Quote } from 'src/service/stocks';

const holdingsCollection = () => getCollections().holding;

export const transformer = {
  currentValue: (holding: Holding, quote: Quote) =>
    holding.shares * quote.regularMarketPrice,
  totalValue: (holding: Holding) => holding.shares * holding.avgPrice,
  profit: (holding: Holding, quote: Quote) => {
    const profitValue =
      transformer.currentValue(holding, quote) -
      transformer.totalValue(holding) +
      (holding?.realizedProfits ?? 0) -
      (holding?.fees ?? 0);

    return {
      value: profitValue,
      percent: Math.abs(profitValue / holding.invested),
    };
  },
  dailyChange: (holding: Holding, quote: Quote) => {
    const dailyChangeValue = quote.regularMarketChange * holding.shares;
    const currentValue = transformer.currentValue(holding, quote);

    return {
      value: dailyChangeValue,
      percent: currentValue ? dailyChangeValue / currentValue : 0,
    };
  },
  summary: (holdings: HoldingWithProfits[]) =>
    holdings.reduce(
      (acc, holding) => {
        acc.shares += holding.shares;
        acc.profit += holding.profit.value;
        acc.currentValue += holding.currentValue;
        acc.invested += holding.invested;
        acc.realized += holding.realizedProfits ?? 0;
        acc.captialGains +=
          holding.profit.value - (holding.realizedProfits ?? 0);
        acc.dailyChange += holding.dailyChange.value;

        return acc;
      },
      {
        shares: 0,
        profit: 0,
        currentValue: 0,
        invested: 0,
        realized: 0,
        captialGains: 0,
        dailyChange: 0,
      }
    ),
};

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
    const holdingTransactions = transactions.filter(
      (t) => t.ticker === holding.ticker
    );

    const buyTransactions = holdingTransactions.filter(
      transactionTransformer.isBuy
    );

    // Total and Average price are calculated by current Buy transactions
    const totalShares = buyTransactions.reduce(
      (acc, t) => acc + t.actualShares,
      0
    );

    holding.avgPrice = totalShares
      ? (buyTransactions.reduce(
          (acc, t) => acc + transactionTransformer.actualValue(t),
          0
        ) ?? 0) / totalShares
      : 0;

    // Calculate invested by transactions funds (original shares)
    holding.invested = buyTransactions.reduce(
      (acc, t) => acc + transactionTransformer.totalValue(t),
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
