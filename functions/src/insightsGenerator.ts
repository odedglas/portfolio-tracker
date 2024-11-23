import * as logger from 'firebase-functions/logger';
import { PortfoliosSchedulerContext } from './types';
import { calculateInsights, getInsightKey } from '../../shared/insights';
import {
  getCollection,
  saveDocuments,
  updateDocuments,
} from './utils/getCollection';
import { PortfolioInsight } from '../../shared/types';

const classifyInsights = (
  persistedInsights: PortfolioInsight[],
  dailyInsights: PortfolioInsight[]
) => {
  const persistedInsightsKeys = persistedInsights.map(getInsightKey);
  const dailyInsightsKeys = dailyInsights.map(getInsightKey);

  const newInsights = dailyInsights.filter(
    (insight) => !persistedInsightsKeys.includes(getInsightKey(insight))
  );

  const deactivatedInsights = persistedInsights.filter(
    (insight) => !dailyInsightsKeys.includes(getInsightKey(insight))
  );

  const recurringInsights = persistedInsights.filter((insight) =>
    dailyInsightsKeys.includes(getInsightKey(insight))
  );

  return {
    newInsights,
    deactivatedInsights,
    recurringInsights,
  };
};

export const insightsGenerator = async (
  context: PortfoliosSchedulerContext
) => {
  const { portfolioHoldings, tickerQuotesMap, dryRun } = context;

  const now = Date.now();
  logger.info('Insights Generator Start', {
    timestamp: new Date(),
    dryRun,
  });

  const persistedInsights = (await getCollection<PortfolioInsight>('insights'))
    .filter((insight) => !insight.expiredAt)
    .map((insight) => ({
      ...insight,
      holding: portfolioHoldings[insight.holdingId],
    }));

  const dailyInsights = Object.values(portfolioHoldings)
    .map((holdings) =>
      holdings.map((holding) => {
        const quote = tickerQuotesMap[holding.ticker];

        return calculateInsights(holding, quote).map((insight) => ({
          ...insight,
          holding,
        }));
      })
    )
    .flat()
    .flat();

  logger.info('Daily generated insights', { dailyInsights: dailyInsights });

  const { newInsights, deactivatedInsights } = classifyInsights(
    persistedInsights,
    dailyInsights
  );

  // Persisting new insights
  logger.info('Persisting new insights', { newInsights });
  if (!dryRun) {
    await saveDocuments('insights', newInsights);
  }

  logger.info('Deactivating insights', { deactivatedInsights });
  if (!dryRun) {
    const updated = deactivatedInsights.map((insight) => ({
      ...insight,
      expiredAt: Date.now(),
    }));

    await updateDocuments('insights', updated);
  }

  // TODO - Add recurringInsights handling - Should save history tags / etc.

  logger.info('Insights Generator Done', {
    totalTime: Date.now() - now,
    dryRun,
  });
};
