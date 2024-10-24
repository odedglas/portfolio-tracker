import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { User } from '../../shared/types';
import { portfolioHistoryTracker } from './portfolioHistoryTracker';
import { migrations } from './migrations';
import { getCollection } from './utils/getCollection';

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
    schedule: 'every day 23:00',
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

export const subscribeToPortfoliosNotifications = onRequest(
  async (request, response) => {
    const { uid } = request.body;

    logger.info('Subscribe user to portfolios notifications', { uid });

    // Getting user
    const user = (await getCollection<User>('users')).find(
      (user) => user.uid === uid
    );

    if (!user) {
      response.status(400).send({ message: 'User not found' });

      return;
    }

    // Subscribe given user to its corresponding topic
    const topic = `portfolios-${uid}`;

    if (!user.messagingToken) {
      response
        .status(500)
        .send({ message: 'User does not have a messaging token' });
      return;
    }

    await admin.messaging().subscribeToTopic(user.messagingToken, topic);

    response.send({ success: true });
  }
);
