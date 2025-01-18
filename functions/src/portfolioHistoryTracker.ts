import * as logger from 'firebase-functions/logger';
import { saveDocuments } from './utils/getCollection';
import { PortfolioHistory } from '../../shared/types';
import {
  holdingsTransformer,
  portfoliosTransformer,
} from '../../shared/transformers';
import { PortfoliosSchedulerContext } from './types';

/**
 * 1. Get all Portfolios
 * 2. Get all Holdings and group by Portfolio
 * 3. For each group, calculate it's summary profit, dailyChange, fees....
 * 4. Save over portfolios_history collection
 *
 * @param {PortfoliosContext} context - The context.
 */
export const portfolioHistoryTracker = async (
  context: PortfoliosSchedulerContext
) => {
  const { portfolioHoldings, portfolios, holdings, dryRun } = context;
  const now = Date.now();

  logger.info('Portfolio History Tracker Start', {
    timestamp: new Date(),
    dryRun,
  });

  // Calculate each portfolio its own KPI's.
  const historyRecords: PortfolioHistory[] = portfolios.map((portfolio) => {
    const activeHoldings = (portfolioHoldings[portfolio.id] || []).filter(
      (holding) => !holding.deleted
    );

    // Deleted holdings won't include `currentValue` computed property and will be excluded from the summary.
    const deletedHoldings = holdings.filter(
      (holding) => holding.portfolioId === portfolio.id && holding.deleted
    );

    const allHoldings = [...activeHoldings, ...deletedHoldings];

    const portfolioSummary = holdingsTransformer.summary(allHoldings);

    const portfolioWithHoldings = {
      ...portfolio,
      ...portfolioSummary,
    };

    const kpis = portfoliosTransformer.portfolioKPIS(portfolioWithHoldings);

    return {
      ...portfolioSummary,
      date: Date.now(),
      portfolioId: portfolio.id,
      profitPercent: kpis.profit.percentage,
      dailyChangePercent: kpis.dailyChange.percentage,
      deposited: portfoliosTransformer.depositsValue(portfolioWithHoldings),
      cashFlow: portfoliosTransformer.cashFlow(portfolioWithHoldings),
      // TODO - Add sectors profits
    };
  });

  logger.info(`Generated ${historyRecords.length} History records`);

  // Saving history records.
  if (!dryRun) {
    await saveDocuments<PortfolioHistory>('portfolioHistory', historyRecords);
  } else {
    historyRecords.forEach((record) => {
      logger.info('Portfolio History Tracker Dry Run', {
        record,
      });
    });
  }

  logger.info('Portfolio History Tracker Done', {
    totalTime: Date.now() - now,
    dryRun,
  });
};
