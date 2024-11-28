import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { portfolioHistoryTracker } from './portfolioHistoryTracker';
import { insightsGenerator } from './insightsGenerator';
import { migrations } from './migrations';
import { alertsHandler } from './alerts';
import { getPortfoliosContext } from './utils/getPortfoliosContext';
import { isTradingDay } from './utils/isTradingDay';

admin.initializeApp();

export const manualPortfolioTracker = onRequest(
  { secrets: ['RAPID_YAHOO_API_KEY'] },
  async (request, response) => {
    const schedulerContext = {
      ...(await getPortfoliosContext()),
      dryRun: request.query.dryRun ? request.query.dryRun === 'true' : true,
    };

    await insightsGenerator(schedulerContext);

    response.send({ success: true });
  }
);

export const migrationsRunner = onRequest(async (request, response) => {
  const { name, dryRun = 'true' } = request.query;

  logger.info('Running migration', { name, dryRun });

  await migrations(name as string, dryRun === 'true');

  response.send({ success: true });
});

export const portfolioScheduler = onSchedule(
  {
    schedule: 'every day 23:50',
    timeZone: 'Asia/Jerusalem',
    secrets: ['RAPID_YAHOO_API_KEY'],
  },
  async (event) => {
    logger.info('Portfolio Daily scheduler starting', {
      timestamp: Date.now(),
      event,
    });

    const schedulerContext = {
      ...(await getPortfoliosContext()),
      dryRun: false,
    };

    // Daily profits
    try {
      await portfolioHistoryTracker(schedulerContext);
    } catch (error: unknown) {
      logger.error('Portfolio Daily scheduler failed', error);
    }

    try {
      // TODO - Add volume insight generate
    } catch (error: unknown) {
      logger.error('Insights generator failed', error);
    }

    return;
  }
);

export const notificationsScheduler = onSchedule(
  {
    secrets: ['ALERTS_RAPID_API_KEY'],
    timeZone: 'America/New_York',
    schedule: 'every 30 minutes from 09:30 to 16:00',
  },
  async () => {
    if (!isTradingDay()) {
      logger.info('Skipping insights generation, not a trading day');
      return;
    }

    const schedulerContext = {
      ...(await getPortfoliosContext()),
      dryRun: false,
    };

    try {
      await alertsHandler(schedulerContext.tickerQuotes);
    } catch (error: unknown) {
      logger.error('Alerts handler failed', error);
    }

    try {
      await insightsGenerator(schedulerContext);
    } catch (error: unknown) {
      logger.error('Insights generator failed', error);
    }
  }
);
