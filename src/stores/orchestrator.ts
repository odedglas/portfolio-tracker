import { defineStore } from 'pinia';
import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'stores/portfolios';
import { useHoldingsStore } from 'stores/holdings';
import { useQuotesStore } from 'stores/quotes';
import { queries } from 'src/service/firebase/collections';
import { useNotificationsStore } from 'stores/notifications';
import { useAlertsStore } from 'stores/alerts';
import { useInsightsStore } from 'stores/insights';

export const useOrchestratorStore = defineStore('orchestrator', {
  state: () => ({}),
  actions: {
    async initialize() {
      const loadingStore = useLoadingStore();
      const quotesStore = useQuotesStore();
      const holdingsStore = useHoldingsStore();
      const portfoliosStore = usePortfolioStore();
      const notificationsStore = useNotificationsStore();
      const alertsStore = useAlertsStore();
      const insightsStore = useInsightsStore();

      await loadingStore.emitLoadingTask(async () => {
        const portfolios = await portfoliosStore.list();
        const portfolioIds = portfolios.map((portfolio) => portfolio.id);

        const holdings = await queries.listPortfoliosHoldings(portfolioIds);

        const holdingsTickers = Array.from(
          new Set(holdings.map((holding) => holding.ticker))
        );

        await Promise.all([
          quotesStore.getTickersQuotes(holdingsTickers),
          quotesStore.setFearAndGreed(),
          notificationsStore.listNotifications(),
          alertsStore.listAlerts(),
          insightsStore.listInsights(portfolioIds),
        ]);

        holdingsStore.setPortfoliosHoldings(holdings);
      });
    },
  },
});
