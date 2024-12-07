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

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

const isInsightActive = ({ expiredAt }: PortfolioInsight) => {
  if (!expiredAt) {
    return true;
  }

  return Date.now() - expiredAt <= ONE_DAY_MS; // Rather insight was expired less than 24 hours ago.
};

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

  const recurringInsights = dailyInsights
    .filter((insight) => persistedInsightsKeys.includes(getInsightKey(insight)))
    .map((insight) => {
      const persisted = persistedInsights.find(
        (persisted) => getInsightKey(persisted) === getInsightKey(insight)
      );

      return {
        ...persisted,
        // Attach only daily inputs to be saved as history
        inputs: insight.inputs,
      };
    }) as PortfolioInsight[];

  return {
    newInsights,
    deactivatedInsights,
    recurringInsights,
  };
};

export const insightsGenerator = async (
  context: PortfoliosSchedulerContext
) => {
  const { holdings, portfolioHoldings, tickerQuotesMap, dryRun } = context;

  const now = Date.now();
  logger.info('Insights Generator Start', {
    timestamp: new Date(),
    dryRun,
  });

  const persistedInsights = (await getCollection<PortfolioInsight>('insights'))
    .filter(isInsightActive)
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

  const { newInsights, deactivatedInsights, recurringInsights } =
    classifyInsights(persistedInsights, dailyInsights);

  // Persisting new insights
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

  logger.info('Deactivating insights', {
    deactivatedInsights: deactivatedInsights.map((insight) => insight.id),
  });
  if (!dryRun) {
    const updated = deactivatedInsights.map((insight) => {
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

    await updateDocuments('insights', updated);
  }

  logger.info('Updating Recurring insights inputs', {
    recurringInsights: recurringInsights.map((insight) => insight.id),
  });
  if (!dryRun) {
    const updated = recurringInsights.map((insight) => ({
      id: insight.id,
      historyInputs: [
        ...(insight.historyInputs ?? []),
        {
          date: Date.now(),
          inputs: insight.inputs,
        },
      ],
    }));

    await updateDocuments('insights', updated);
  }

  logger.info('Insights Generator Done', {
    totalTime: Date.now() - now,
    dryRun,
  });
};
