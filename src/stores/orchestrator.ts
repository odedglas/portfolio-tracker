import { defineStore } from 'pinia';
import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'stores/portfolios';
import { useQuotesStore } from 'stores/quotes';
import { queries } from 'src/service/firebase/collections';

export const useOrchestratorStore = defineStore('orchestrator', {
  state: () => ({}),
  actions: {
    async initialize() {
      const loadingStore = useLoadingStore();
      const quotesStore = useQuotesStore();
      const portfoliosStore = usePortfolioStore();

      await loadingStore.emitLoadingTask(async () => {
        const portfolios = await portfoliosStore.list();

        const holdings = await queries.listPortfoliosHoldings(
          portfolios.map((portfolio) => portfolio.id)
        );

        const holdingsTickers = Array.from(
          new Set(holdings.map((holding) => holding.ticker))
        );

        const quotes = await quotesStore.getTickersQuotes(holdingsTickers);

        console.log('Holdings:', holdings, quotes);
      });
    },
  },
});
