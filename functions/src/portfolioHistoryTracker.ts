import * as logger from 'firebase-functions/logger';
import { getTickersQuotes } from './utils/getTickersQuotes';
import { getCollection, saveDocuments } from './utils/getCollection';
import {
  Holding,
  HoldingWithProfits,
  Portfolio,
  PortfolioHistory,
  Quote,
} from '../../shared/types';
import {
  holdingsTransformer,
  portfoliosTransformer,
} from '../../shared/transformers';

/**
 * 1. Get all Portfolios
 * 2. Get all Holdings and group by Portfolio
 * 3. For each group, calculate it's summary profit, dailyChange, fees....
 * 4. Save over portfolios_history collection
 *
 * @param {boolean} dryRun - Rather to use "dryRun" mode or not.
 */
export const portfolioHistoryTracker = async (dryRun = false) => {
  const now = Date.now();
  logger.info('Portfolio History Tracker Start', {
    timestamp: new Date(),
    dryRun,
  });

  const portfolios = await getCollection<Portfolio>('portfolios');
  const holdings = await getCollection<Holding>('holdings');

  const holdingTickers = holdings.map((holding) => holding.ticker);
  const tickerQuotes = await getTickersQuotes(holdingTickers);

  const tickerQuotesMap: Record<string, Quote> = tickerQuotes.reduce(
    (acc, quote) => ({
      ...acc,
      [quote.symbol]: quote,
    }),
    {}
  );

  // For each holding, calculate it's "withProfits" entity.
  const holdingsWithProfits = holdings.map((holding) =>
    holdingsTransformer.withProfits(holding, tickerQuotesMap)
  );

  // Group holdings by portfolio
  const portfolioHoldings = holdingsWithProfits.reduce((acc, holding) => {
    acc[holding.portfolioId] ||= [];

    acc[holding.portfolioId].push(holding);

    return acc;
  }, {} as Record<string, HoldingWithProfits[]>);

  // Calculate each portfolio its own KPI's.
  const historyRecords: PortfolioHistory[] = portfolios.map((portfolio) => {
    const portfolioSummary = holdingsTransformer.summary(
      portfolioHoldings[portfolio.id] || []
    );
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
