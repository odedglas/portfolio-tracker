import { getToken } from 'firebase/messaging';
import { messaging } from './core';
import { firebaseConfig } from './config';

export const getMessagingToken = () =>
  getToken(messaging, { vapidKey: firebaseConfig.messagingPK });
