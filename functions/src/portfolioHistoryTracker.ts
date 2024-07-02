import * as logger from 'firebase-functions/logger';
import { getTickersQuotes } from './utils/getTickersQuotes';
import { getCollection } from './utils/getCollection';
import { Holding } from '../../shared/types';

/**
 * 1. Get all Portfolios
 * 2. Get all Holdings and group by Portfolio
 * 3. For each group, calculate it's summary profit, dailyChange, fees....
 * 4. Save over portfolios_history collection
 */
export const portfolioHistoryTracker = async () => {
  const now = Date.now();
  const tickers = ['SPY', 'FVRR', 'QQQ'];

  const holdings = await getCollection<Holding>('holdings');
  const tickerQuotes = await getTickersQuotes(tickers);

  console.log('Holdings', holdings);
  console.log('Tickers Quote', tickerQuotes);

  // For each holding, calculate it's "withProfits" entity.

  // Group by portfolio and get it's summary - This will grant us Portfolio level profits/changes.

  // For each portfolio, create a daily_history record

  logger.info('Portfolio History Tracker Done', {
    timestamp: Date.now() - now,
  });
};
