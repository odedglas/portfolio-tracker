import * as admin from 'firebase-admin';
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { portfolioHistoryTracker } from './portfolioHistoryTracker';
import { migrations } from './migrations';
import { sendNotification } from './utils/notifications';

admin.initializeApp();

export const manualPortfolioTracker = onRequest(
  { secrets: ['RAPID_YAHOO_API_KEY'] },
  async (_request, response) => {
    await portfolioHistoryTracker(true);

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
    logger.info('Portfolio tracker scheduler starting', {
      timestamp: Date.now(),
      event,
    });
    await portfolioHistoryTracker();
    return;
  }
);

export const pushDummyzNotification = onCall((request) => {
  const { uid } = request.data ?? request.auth?.uid ?? {};

  if (!uid) {
    throw new HttpsError('invalid-argument', 'uid is required');
  }

  return sendNotification(uid, {
    title: 'Hello',
    body: 'Testme',
    data: { ticker: 'SS', portfolioId: 'hSW0BwsmD3ELogXt95Br', targetPrice: '120', },
    type: 'priceAlert',
  });
});
