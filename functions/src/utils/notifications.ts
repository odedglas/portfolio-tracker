import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';
import { Message } from 'firebase-admin/messaging';
import { getCollection } from './getCollection';
import { User, Notification } from '../../../shared/types';

export const sendNotification = async (
  uid: string,
  notification: Partial<Notification>
) => {
  logger.info('Sending user device notifications', {
    uid,
    type: notification.type,
  });

  // Getting user
  const user = (await getCollection<User>('users')).find(
    (user) => user.uid === uid
  );

  if (!user) {
    throw new HttpsError('not-found', 'User not found');
  }

  const { body, title } = notification;

  const message: Message = {
    notification: {
      title,
      body,
    },
    data: notification.data ?? {},
    token: user.messagingToken ?? '',
  };

  logger.info('Sending Notification to user device ', {
    uid,
    type: notification.type,
    data: notification.data,
    messagingToken: user.messagingToken,
  });

  await admin.messaging().send(message);
};
