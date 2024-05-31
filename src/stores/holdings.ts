import { defineStore } from 'pinia';
import holdingsAPI from 'src/service/holdings';
import { useTransactionsStore } from 'stores/transactions';
import { Holding, Transaction } from 'src/types';

interface HoldingsStoreState {
  holdings: Holding[];
  loading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let transactionsAddListener: () => void;

export const useHoldingsStore = defineStore('holdings', {
  state: (): HoldingsStoreState => ({
    holdings: [],
    loading: false,
  }),
  getters: {
    total(state) {
      return state.holdings.reduce((total, holding) => {
        const lastTickerValue = useTransactionsStore().tickerQuotes[holding.ticker];

        if (lastTickerValue) {
          const currentPrice = holding.shares * lastTickerValue.regularMarketPrice;
          const avgCost = holding.shares * holding.avgPrice;

          total.value += currentPrice;
          total.profit += currentPrice - avgCost;
        }

        return total;
      }, { profit: 0, value: 0 });
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
          if (name === 'list' || name === 'update') {
            // TODO - Handle update - Price affects holding.
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
            return await holdingsAPI.delete(holding.id);
          }

          // Calculate after action AVG price
          context.after(async () => {
            const holdingTransactions = transactionsStore.transactions.filter(
              (t) => t.ticker === transaction.ticker && t.action === 'buy'
            );

            const totalShares = holdingTransactions.reduce(
              (acc, t) => acc + t.actualShares,
              0
            );

            holding.avgPrice = totalShares
              ? (holdingTransactions.reduce(
                  (acc, t) => acc + t.price * t.actualShares,
                  0
                ) ?? 0) / totalShares
              : 0;

            holding.id = (await holdingsAPI.update(holding, holding.id)).id;
          });
        }
      );

      this.loading = false;

      return this.holdings;
    },
    create(transaction: Transaction) {
      const { portfolioId, ticker, name, logoImage } = transaction;

      const holding = {
        id: '',
        portfolioId,
        shares: 0,
        ticker,
        name,
        logoImage,
        avgPrice: transaction.price,
      };

      this.holdings.push(holding as Holding);

      return holding;
    },
    async remove(holdingId: string) {
      await holdingsAPI.delete(holdingId);
      this.holdings = this.holdings.filter((holding) => holding.id !== holdingId);
    },
  },
});
