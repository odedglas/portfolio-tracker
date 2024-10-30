import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { AppCollections } from 'app/shared/types';
import { messaging } from './core';
import { firebaseConfig } from './config';

const swMessagingChannel = new BroadcastChannel('firebase-sw-messages');

type Notification = AppCollections['notifications'];

type OnNewNotificationCallback = (payload: Notification) => void;

let token: string;
let listening = false;

const onMessageHandler = (
  payload: MessagePayload,
  callback: OnNewNotificationCallback
) => {
  console.log('******** [Messaging] ********** Message received', payload);
  const notificationPayloadText = payload.data?.notificationPayload;

  if (!notificationPayloadText) {
    console.log(
      '******** [Messaging] ********** Empty notification payload, cannot parse',
      payload
    );
    return;
  }

  const notification = JSON.parse(notificationPayloadText) as Notification;
  callback(notification);
};

const listenForMessages = (callback: OnNewNotificationCallback) => {
  if (!token || listening) {
    return;
  }

  // Firebase Foreground messages
  onMessage(messaging, (payload) => onMessageHandler(payload, callback));

  // Firebase SW Background messages
  swMessagingChannel.addEventListener('message', (event) =>
    onMessageHandler(event.data as MessagePayload, callback)
  );

  listening = true;
};

export const initializeMessaging = async (
  callback: OnNewNotificationCallback
) => {
  token = await getToken(messaging, { vapidKey: firebaseConfig.messagingPK });

  listenForMessages(callback);

  return token;
};

export const requestMessagingPermission = async (
  callback: OnNewNotificationCallback
) => {
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    return;
  }

  return initializeMessaging(callback);
};
