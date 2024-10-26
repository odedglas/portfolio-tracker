import { httpsCallable } from 'firebase/functions';
import { functions } from './core';

export const pushDummy = (userUid: string) => {
  console.log('Pushing', userUid);
  const instance = httpsCallable(functions, 'pushDummyzNotification');

  return instance({ uid: userUid });
};
