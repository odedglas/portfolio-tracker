import { defineStore } from 'pinia';
import holdingsAPI, { transformer } from 'src/service/holdings';
import { useTransactionsStore } from 'stores/transactions';
import { Holding, Transaction } from 'src/types';

interface HoldingsStoreState {
  holdings: Holding[];
  loading: boolean;
}

interface HoldingWithProfits extends Holding {
  currentValue: number;
  profit: {
    value: number;
    percent: number;
  };
  dailyChange: {
    value: number;
    percent: number;
  };
}

interface HoldingsSummary {
  shares: number;
  invested: number;
  profit: number;
  currentValue: number;
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
        const lastTickerQuote =
          useTransactionsStore().tickerQuotes[holding.ticker];

        const currentValue = transformer.currentValue(holding, lastTickerQuote);
        const profit = transformer.profit(holding, lastTickerQuote);
        const dailyChange = transformer.dailyChange(holding, lastTickerQuote);

        return {
          ...holding,
          currentValue,
          profit,
          dailyChange,
        };
      });
    },
    summary(): HoldingsSummary {
      return this.holdingsWithProfits.reduce(
        (acc, holding) => {
          acc.shares += holding.shares;
          acc.profit += holding.profit.value;
          acc.currentValue += holding.currentValue;
          acc.invested += holding.invested;

          return acc;
        },
        {
          shares: 0,
          profit: 0,
          currentValue: 0,
          invested: 0,
        }
      );
    },
  },
  actions: {
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
            holding.id = (
              await holdingsAPI.syncHoldingWithTransactions(
                holding,
                transactionsStore.transactions
              )
            ).id;
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
