import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './core';
import { firebaseConfig } from './config';

let token: string;
let listening = false;

const listenForMessages = () => {
  if (!token || listening) {
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('******** [Messaging] ********** Message received', payload);
  });

  listening = true;
};

export const initializeMessaging = async () => {
  token = await getToken(messaging, { vapidKey: firebaseConfig.messagingPK });

  listenForMessages();

  return token;
};

export const requestMessagingPermission = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    return;
  }

  return initializeMessaging();
};
