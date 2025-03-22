import { defineStore } from 'pinia';
import { PortfolioInsight, ViewPortfolioInsight } from 'app/shared/types';
import insightsAPI from 'src/service/insights';
import { useHoldingsStore } from 'stores/holdings';
import { useQuotesStore } from 'stores/quotes';
import { calculateInsights, calculateInsightTags } from 'app/shared/insights';
import { usePortfolioStore } from 'stores/portfolios';

type InsightsState = {
  storedInsights: PortfolioInsight[];
  loading: boolean;
};

export const useInsightsStore = defineStore('insights', {
  state: (): InsightsState => ({
    storedInsights: [],
    loading: false,
  }),
  getters: {
    dailyInsights(state): ViewPortfolioInsight[] {
      const holdings = useHoldingsStore().portfolioHoldings;

      if (!holdings.length) {
        return [];
      }

      return holdings
        .map((holding) => {
          const quote = useQuotesStore().tickerQuotes[holding.ticker];

          return calculateInsights(holding, quote).map((insight) => {
            const storedInsight = state.storedInsights.find(
              (storedInsight) => storedInsight.identifier === insight.identifier
            );

            return {
              ...insight,
              ...(storedInsight && {
                id: storedInsight.id,
                expiredAt: storedInsight.expiredAt,
                createdAt: storedInsight.createdAt,
                historyInputs: storedInsight.historyInputs,
              }),
              holding,
            };
          });
        })
        .flat();
    },
    inactiveInsights(state): ViewPortfolioInsight[] {
      const selectedPortfolioId = usePortfolioStore().selectedPortfolio?.id;
      const holdings = useHoldingsStore().portfolioHoldings;
      if (!holdings.length) {
        return [];
      }

      const dailyInsightsIdentifiers = this.dailyInsights.map(
        (insight) => insight.identifier
      );

      return state.storedInsights
        .filter(
          (insight) => !dailyInsightsIdentifiers.includes(insight.identifier)
        )
        .filter((insight) => insight.portfolioId === selectedPortfolioId)
        .map((insight) => {
          const holding = holdings.find(
            (holding) => holding.id === insight.holdingId
          );

          if (!holding) {
            console.warn(
              'Insights generator - Cannot match to holding id. probably holding was removed',
              insight.id
            );
            return;
          }

          const quote = useQuotesStore().tickerQuotes[holding.ticker];
          const tags = calculateInsightTags(insight, quote);

          return {
            ...insight,
            holding,
            // Override tags with latest quote calculations
            tags,
          };
        })
        .filter(Boolean) as ViewPortfolioInsight[];
    },
  },
  actions: {
    async listInsights(portfolioIds: string[]) {
      this.storedInsights = await insightsAPI.list(portfolioIds);
    },
    async removeInsight(id: string) {
      await insightsAPI.remove(id);

      this.storedInsights = this.storedInsights.filter(
        (insight) => insight.id !== id
      );
    },
  },
});
