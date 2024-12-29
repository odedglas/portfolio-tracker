import { groupBy, mapValues } from 'lodash';
import { defineStore } from 'pinia';
import { holdingsTransformer } from 'app/shared/transformers';
import holdingsAPI from 'src/service/holdings';
import { usePortfolioStore } from 'stores/portfolios';
import { useTransactionsStore } from 'stores/transactions';
import { useQuotesStore } from 'stores/quotes';
import { Holding, Transaction, HoldingsSummary } from 'app/shared/types';

interface HoldingsStoreState {
  holdings: Holding[];
  loading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let transactionsAddListener: () => void;

const calculateHoldingValue = (holding: Holding) => {
  const tickerQuotes = useQuotesStore().tickerQuotes;

  return holdingsTransformer.withProfits(holding, tickerQuotes);
};

export const useHoldingsStore = defineStore('holdings', {
  state: (): HoldingsStoreState => ({
    holdings: [],
    loading: false,
  }),
  getters: {
    portfolioHoldings(state) {
      const portfoliosStore = usePortfolioStore();
      const selectedPortfolio = portfoliosStore.selectedPortfolio;

      return state.holdings
        .filter((holding) => holding.portfolioId === selectedPortfolio?.id)
        .filter((holding) => !holding?.deleted) // Realized holdings won't have shares.
        .map(calculateHoldingValue);
    },
    deletedHoldings(state) {
      const portfoliosStore = usePortfolioStore();
      const selectedPortfolio = portfoliosStore.selectedPortfolio;

      return state.holdings
        .filter((holding) => holding.portfolioId === selectedPortfolio?.id)
        .filter((holding) => holding?.deleted);
    },
    portfoliosHoldingsMap(state) {
      // Portfolio to holdings map with summary attached
      const holdingsByPortfolio = groupBy(state.holdings, 'portfolioId');

      return mapValues(holdingsByPortfolio, (holdings) => {
        const holdingsWithProfits = holdings.map(calculateHoldingValue);

        return holdingsTransformer.summary(holdingsWithProfits);
      });
    },
    summary(): HoldingsSummary {
      return holdingsTransformer.summary(this.portfolioHoldings);
    },
    holdingsSectors(): string[] {
      const holdings = this.portfolioHoldings;

      return [...new Set(holdings.map((holding) => holding.sector))].filter(
        Boolean
      ) as string[];
    },
  },
  actions: {
    setPortfoliosHoldings(holdings: Holding[]) {
      const transactionsStore = useTransactionsStore();
      this.holdings = holdings;

      transactionsAddListener ||= transactionsStore.$onAction(
        async (context) => {
          const selectedPortfolioId = usePortfolioStore().selectedPortfolioId;
          const { name, args } = context;

          if (name === 'list') {
            return;
          }

          const [transaction] = args as [Transaction];
          const isBuy = transaction.action === 'buy';

          const holding =
            this.holdings.find(
              (holding) =>
                holding.ticker === transaction.ticker &&
                holding.portfolioId === selectedPortfolioId
            ) ?? this.create(transaction);

          if (name === 'remove') {
            holding.shares += transaction.actualShares * (isBuy ? -1 : 1);
          } else if (name === 'add') {
            holding.shares += transaction.actualShares * (isBuy ? 1 : -1);
          }

          if (holding.shares <= 0) {
            // Marking holding as deleted.
            await this.remove(holding.id);
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
    },
    create(transaction: Transaction): Holding {
      const { portfolioId, ticker, name, logoImage, price, sector } =
        transaction;

      const holding = {
        id: '',
        createdAt: Date.now(),
        portfolioId,
        shares: 0,
        ticker,
        name,
        logoImage,
        sector,
        avgPrice: price,
        invested: price * transaction.actualShares,
      };

      this.holdings.push(holding as Holding);

      return holding;
    },
    async remove(holdingId: string) {
      await holdingsAPI.delete(holdingId);

      const deletedHolding = this.holdings.find(
        (holding) => holding.id !== holdingId
      );

      if (!deletedHolding) {
        throw new Error('Cannot mark holding as deleted, Holding not found');
      }

      this.holdings = [
        ...this.holdings.filter((holding) => holding.id !== holdingId),
        { ...deletedHolding, deleted: true },
      ];
    },
  },
});
