import { defineStore } from 'pinia';
import holdingsAPI from 'src/service/holdings';
import { useTransactionsStore } from 'stores/transactions';
import { Holding, Transaction } from 'src/types';
import { transformer } from 'src/service/transactions';

interface HoldingsStoreState {
  holdings: Holding[];
  loading: boolean;
}

interface HoldingWithProfits extends Holding {
  currentValue: number;
  profit: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let transactionsAddListener: () => void;

export const useHoldingsStore = defineStore('holdings', {
  state: (): HoldingsStoreState => ({
    holdings: [],
    loading: false,
  }),
  getters: {
    holdingsWithProfits(state): HoldingWithProfits[] {
      return state.holdings.map((holding) => {
        const lastTickerValue =
          useTransactionsStore().tickerQuotes[holding.ticker];

        if (lastTickerValue) {
          const currentValue =
            holding.shares * lastTickerValue.regularMarketPrice;
          const avgCost =
            holding.shares * holding.avgPrice - (holding?.fees ?? 0);

          return {
            ...holding,
            currentValue,
            profit: currentValue - avgCost + (holding?.realizedProfits ?? 0),
          };
        }

        return holding;
      }) as HoldingWithProfits[];
    },
  },
  actions: {
    async syncHoldingWithTransactions(
      holding: Holding,
      transactions: Transaction[]
    ) {
      // Total and Average price are calculated by current Buy transactions
      const totalShares = transactions
        .filter(transformer.isBuy)
        .reduce((acc, t) => acc + t.actualShares, 0);

      holding.avgPrice = totalShares
        ? (transactions
            .filter(transformer.isBuy)
            .reduce((acc, t) => acc + t.price * t.actualShares, 0) ?? 0) /
          totalShares
        : 0;

      // Calculate invested by transactions funds (original shares)
      holding.invested = transactions
        .filter(transformer.isBuy)
        .reduce((acc, t) => acc + t.price * t.shares, 0);

      // Fees and profits would be calculated by the whole set.
      holding.fees = transactions.reduce((acc, t) => acc + (t.fees ?? 0), 0);

      holding.realizedProfits = transactions.reduce(
        (acc, t) => acc + (t.realizedProfit ?? 0),
        0
      );

      holding.id = (await holdingsAPI.update(holding, holding.id)).id;
    },
    async list(portfolioId: string) {
      const transactionsStore = useTransactionsStore();
      this.loading = true;

      if (!portfolioId) {
        throw Error('Cannot get holdings without Portfolio id');
      }

      this.holdings = await holdingsAPI.list(portfolioId);

      transactionsAddListener ||= transactionsStore.$onAction(
        async (context) => {
          const { name, args } = context;
          if (name === 'list') {
            return;
          }

          const [transaction] = args as [Transaction];
          const isBuy = transaction.action === 'buy';

          const holding =
            this.holdings.find(
              (holding) => holding.ticker === transaction.ticker
            ) ?? this.create(transaction);

          if (name === 'remove') {
            holding.shares += transaction.actualShares * (isBuy ? -1 : 1);
          } else if (name === 'add') {
            holding.shares += transaction.actualShares * (isBuy ? 1 : -1);
          }

          if (holding.shares <= 0) {
            return await this.remove(holding.id);
          }

          // Calculate after action AVG price
          context.after(async () => {
            const holdingTransactions = transactionsStore.transactions.filter(
              (t) => t.ticker === transaction.ticker
            );

            await this.syncHoldingWithTransactions(
              holding,
              holdingTransactions
            );
          });
        }
      );

      this.loading = false;

      return this.holdings;
    },
    create(transaction: Transaction): Holding {
      const { portfolioId, ticker, name, logoImage, price } = transaction;

      const holding = {
        id: '',
        createdAt: Date.now(),
        portfolioId,
        shares: 0,
        ticker,
        name,
        logoImage,
        avgPrice: price,
        invested: price * transaction.actualShares,
      };

      this.holdings.push(holding as Holding);

      return holding;
    },
    async remove(holdingId: string) {
      await holdingsAPI.delete(holdingId);
      this.holdings = this.holdings.filter(
        (holding) => holding.id !== holdingId
      );
    },
  },
});
