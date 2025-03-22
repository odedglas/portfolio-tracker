import * as logger from 'firebase-functions/logger';
import { PortfoliosSchedulerContext } from './types';
import {
  calculateInsightInputs,
  calculateInsights,
  getInsightKey,
} from '../../shared/insights';
import {
  getCollection,
  saveDocuments,
  updateDocuments,
} from './utils/getCollection';
import { PortfolioInsight } from '../../shared/types';
import { ONE_DAY_MS } from './constants';

/**
 * Determines if an insight is still active based on its expiration date
 * @param insight - The insight to check
 */
const isInsightActive = ({ expiredAt }: PortfolioInsight) => {
  if (!expiredAt) {
    return true;
  }

  return Date.now() - expiredAt <= ONE_DAY_MS; // Rather insight was expired less than 24 hours ago.
};

/**
 * Identifies new insights that don't exist in the persisted set
 * @param persistedInsights - Currently persisted insights in the database
 * @param dailyInsights - Newly calculated insights
 * @return Array of new insights to be saved
 */
const identifyNewInsights = (
  persistedInsights: PortfolioInsight[],
  dailyInsights: PortfolioInsight[]
): PortfolioInsight[] => {
  const persistedInsightKeys = persistedInsights.map(getInsightKey);

  return dailyInsights.filter(
    (insight) => !persistedInsightKeys.includes(getInsightKey(insight))
  );
};

/**
 * Identifies insights that are no longer active in the current calculation
 * @param persistedInsights - Currently persisted insights in the database
 * @param dailyInsights - Newly calculated insights
 * @return Array of insights that should be deactivated
 */
const identifyDeactivatedInsights = (
  persistedInsights: PortfolioInsight[],
  dailyInsights: PortfolioInsight[]
): PortfolioInsight[] => {
  const dailyInsightKeys = dailyInsights.map(getInsightKey);

  return persistedInsights.filter(
    (insight) => !dailyInsightKeys.includes(getInsightKey(insight))
  );
};

/**
 * Identifies recurring insights that exist in both persisted and daily sets
 * @param persistedInsights - Currently persisted insights in the database
 * @param dailyInsights - Newly calculated insights
 * @return Array of recurring insights with updated inputs
 */
const identifyRecurringInsights = (
  persistedInsights: PortfolioInsight[],
  dailyInsights: PortfolioInsight[]
): PortfolioInsight[] => {
  const persistedInsightKeys = persistedInsights.map(getInsightKey);

  return dailyInsights
    .filter((insight) => persistedInsightKeys.includes(getInsightKey(insight)))
    .map((dailyInsight) => {
      const persistedInsight = persistedInsights.find(
        (persisted) => getInsightKey(persisted) === getInsightKey(dailyInsight)
      );

      return {
        ...persistedInsight,
        // Attach only daily inputs to be saved as history
        inputs: dailyInsight.inputs,
      };
    }) as PortfolioInsight[];
};

/**
 * Classifies insights into new, deactivated, and recurring categories
 * @param persistedInsights - Currently persisted insights in the database
 * @param dailyInsights - Newly calculated insights
 * @return Object containing categorized insights
 */
const classifyInsights = (
  persistedInsights: PortfolioInsight[],
  dailyInsights: PortfolioInsight[]
) => {
  return {
    newInsights: identifyNewInsights(persistedInsights, dailyInsights),
    deactivatedInsights: identifyDeactivatedInsights(
      persistedInsights,
      dailyInsights
    ),
    recurringInsights: identifyRecurringInsights(
      persistedInsights,
      dailyInsights
    ),
  };
};

/**
 * Generates insights for portfolio holdings and manages their lifecycle
 * @param context - Context containing portfolio and holding data
 */
export const insightsGenerator = async (
  context: PortfoliosSchedulerContext
) => {
  const { holdings, portfolioHoldings, tickerQuotesMap, dryRun } = context;

  const now = Date.now();
  logger.info('Insights Generator Start', {
    timestamp: new Date(),
    dryRun,
  });

  // Get active insights from the database
  const persistedInsights = (await getCollection<PortfolioInsight>('insights'))
    .filter(isInsightActive)
    .map((insight) => ({
      ...insight,
      holding: portfolioHoldings[insight.holdingId],
    }));

  // Calculate new insights for all holdings
  const dailyInsights = Object.values(portfolioHoldings)
    .map((holdingsGroup) =>
      holdingsGroup
        .filter((holding) => !holding.deleted)
        .map((holding) => {
          const quote = tickerQuotesMap[holding.ticker];
          return calculateInsights(holding, quote).map((insight) => ({
            ...insight,
            holding,
          }));
        })
    )
    .flat()
    .flat();

  // Classify insights into categories
  const { newInsights, deactivatedInsights, recurringInsights } =
    classifyInsights(persistedInsights, dailyInsights);

  // Handle new insights
  logger.info('Persisting new insights', { newInsights });
  if (!dryRun) {
    await saveDocuments(
      'insights',
      newInsights.map((insight) => ({
        ...insight,
        historyInputs: [{ date: Date.now(), inputs: insight.inputs }],
      }))
    );
  }

  // Handle deactivated insights
  logger.info('Deactivating insights', {
    deactivatedInsights: deactivatedInsights.map((insight) => insight.id),
  });
  if (!dryRun) {
    const updatedDeactivatedInsights = deactivatedInsights.map((insight) => {
      const holding = holdings.find(
        (holding) => holding.id === insight.holdingId
      );

      if (!holding) {
        logger.error('Holding not found', { holdingId: insight.holdingId });
        throw new Error('Holding not found');
      }

      const currentInputs = calculateInsightInputs(
        insight,
        holding,
        tickerQuotesMap[holding.ticker]
      );

      return {
        id: insight.id,
        expiredAt: insight.expiredAt ?? Date.now(),
        historyInputs: [
          ...(insight?.historyInputs ?? []),
          {
            date: Date.now(),
            inputs: currentInputs,
          },
        ],
      };
    });

    await updateDocuments('insights', updatedDeactivatedInsights);
  }

  // Handle recurring insights
  logger.info('Updating Recurring insights inputs', {
    recurringInsights: recurringInsights.map((insight) => insight.id),
  });
  if (!dryRun) {
    const updatedRecurringInsights = recurringInsights.map((insight) => ({
      id: insight.id,
      historyInputs: [
        ...(insight.historyInputs ?? []),
        {
          date: Date.now(),
          inputs: insight.inputs,
        },
      ],
    }));

    await updateDocuments('insights', updatedRecurringInsights);
  }

  logger.info('Insights Generator Done', {
    totalTime: Date.now() - now,
    dryRun,
  });
};
