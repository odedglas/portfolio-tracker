import { defineStore } from 'pinia';
import { PortfolioInsight, ViewPortfolioInsight } from 'app/shared/types';
import insightsAPI from 'src/service/insights';
import { useHoldingsStore } from 'stores/holdings';
import { useQuotesStore } from 'stores/quotes';
import { calculateInsights } from 'app/shared/insights';

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
    viewInsights(state): ViewPortfolioInsight[] {
      const holdings = useHoldingsStore().portfolioHoldings;

      if (!holdings.length) {
        return [];
      }

      return holdings
        .map((holding) => {
          const quote = useQuotesStore().tickerQuotes[holding.ticker];

          return calculateInsights(holding, quote).map((insight) => {
            const storedInsight = state.storedInsights.find(
              (storedInsight) => storedInsight.holdingId === holding.id
            );

            return {
              ...insight,
              expiredAt: storedInsight?.expiredAt,
              createdAt: storedInsight?.createdAt,
              holding,
            };
          });
        })
        .flat();
    },
  },
  actions: {
    async listInsights(portfolioIds: string[]) {
      this.storedInsights = await insightsAPI.list(portfolioIds);
    },
  },
});
