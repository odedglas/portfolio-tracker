import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { getCollection } from './utils/getCollection';
import { User } from '../../shared/types';

export const pushDummyNotification = async (uid: string) => {
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
};
