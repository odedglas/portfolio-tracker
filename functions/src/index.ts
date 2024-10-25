import * as admin from 'firebase-admin';
import { onRequest, onCall } from 'firebase-functions/v2/https';
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

export const subscribeToNotifications = onCall(async (request) => {
  const { uid } = request.data;

  logger.info('Subscribe user to portfolios notifications', {
    uid,
    test: true,
  });

  // Getting user
  const user = (await getCollection<User>('users')).find(
    (user) => user.uid === uid
  );

  if (!user) {
    throw new Error('User not found');
  }

  // Subscribe given user to its corresponding topic
  const topic = `portfolios-${uid}`;

  if (!user.messagingToken) {
    throw new Error('User does not have a messaging token');
  }

  logger.info('Subscribing user to topic', { uid, topic });

  await admin.messaging().subscribeToTopic(user.messagingToken, topic);
});

export const pushDummyzNotification = onCall(async (request) => {
  const { uid } = request.data;

  logger.info('Pushing dummy notifications', { uid, test: true });

  // Getting user
  const user = (await getCollection<User>('users')).find(
    (user) => user.uid === uid
  );

  if (!user) {
    throw new Error('User not found');
  }

  const topic = `portfolios-${uid}`;

  const message = {
    notification: {
      title: 'Dummy notification',
      body: 'This is a dummy notification',
    },
    token: user.messagingToken ?? '',
  };

  logger.info('Sending dummy message ', {
    uid,
    topic,
    messagingToken: user.messagingToken,
  });

  const res = await admin.messaging().send(message);

  logger.info('Finished sending dummy message', { res });
});
