import { defineStore } from 'pinia';
import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'stores/portfolios';
import { useHoldingsStore } from 'stores/holdings';
import { useQuotesStore } from 'stores/quotes';
import { queries } from 'src/service/firebase/collections';

export const useOrchestratorStore = defineStore('orchestrator', {
  state: () => ({}),
  actions: {
    async initialize() {
      const loadingStore = useLoadingStore();
      const quotesStore = useQuotesStore();
      const holdingsStore = useHoldingsStore();
      const portfoliosStore = usePortfolioStore();

      await loadingStore.emitLoadingTask(async () => {
        const portfolios = await portfoliosStore.list();

        const holdings = await queries.listPortfoliosHoldings(
          portfolios.map((portfolio) => portfolio.id)
        );

        const holdingsTickers = Array.from(
          new Set(holdings.map((holding) => holding.ticker))
        );

        await quotesStore.getTickersQuotes(holdingsTickers);
        await quotesStore.setFearAndGreed();

        holdingsStore.setPortfoliosHoldings(holdings);
      });
    },
  },
});
