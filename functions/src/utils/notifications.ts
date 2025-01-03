import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';
import { MulticastMessage } from 'firebase-admin/messaging';
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

  const message: MulticastMessage = {
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        title,
        body,
        icon,
        badge:
          'https://portfolio-tracker-73341.firebaseapp.com/icons/logo-short-v3.svg',
        vibrate: [200, 100, 200],
        data: {
          notificationPayload: JSON.stringify(notification),
        },
        fcmOptions: {
          link: 'https://portfolio-tracker-73341.firebaseapp.com',
        },
      },
    },
    data: {
      notificationPayload: JSON.stringify(notification),
    },
    tokens: user.deviceTokens ?? [user.messagingToken ?? ''],
  };

  logger.info('Sending Notification to user device ', {
    uid,
    messagePayload: message,
    messagingToken: user.messagingToken,
  });

  await admin.messaging().sendEachForMulticast(message);
};
