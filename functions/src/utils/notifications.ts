import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';
import { Message } from 'firebase-admin/messaging';
import { getCollection, saveDocuments } from './getCollection';
import { User, Notification } from '../../../shared/types';

export const sendNotification = async (
  uid: string,
  notification: Partial<Notification>
) => {
  await saveDocuments('notifications', [notification as Notification]);

  // Early skip if there is no need to push towards user device.
  if (!notification.sendPush) {
    return;
  }

  // Getting user
  const user = (await getCollection<User>('users')).find(
    (user) => user.uid === uid
  );

  if (!user) {
    throw new HttpsError('not-found', 'User not found');
  }

  const { body, title, icon = '' } = notification;

  const message: Message = {
    notification: {
      title,
      body,
      imageUrl: icon,
    },
    data: {
      notificationPayload: JSON.stringify(notification),
    },
    token: user.messagingToken ?? '',
  };

  logger.info('Sending Notification to user device ', {
    uid,
    message,
    messagingToken: user.messagingToken,
  });

  await admin.messaging().send(message);
};
