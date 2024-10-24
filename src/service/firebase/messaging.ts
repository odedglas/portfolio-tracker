import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './core';
import { firebaseConfig } from './config';

export const getMessagingToken = () =>
  getToken(messaging, { vapidKey: firebaseConfig.messagingPK });

export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
  });
};
