import { httpsCallable } from 'firebase/functions';
import { functions } from './core';

export const subscribeToPortfolioNotifications = (userUid: string) => {
  const instance = httpsCallable(functions, 'subscribeToNotifications');

  return instance({ uid: userUid });
};

export const pushDummy = (userUid: string) => {
  console.log('Pushing', userUid);
  const instance = httpsCallable(functions, 'pushDummyzNotification');

  return instance({ uid: userUid });
};
