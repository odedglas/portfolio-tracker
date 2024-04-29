import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { auth } from './core';
import { FIREBASE_LOGIN_PROVIDERS } from 'src/constants';

const AuthenticationProviders = {
  [FIREBASE_LOGIN_PROVIDERS.GOOGLE]: new GoogleAuthProvider(),
  [FIREBASE_LOGIN_PROVIDERS.TWITTER]: new TwitterAuthProvider(),
  [FIREBASE_LOGIN_PROVIDERS.FACEBOOK]: new FacebookAuthProvider(),
};

export const authentication = {
  signInWithPassword: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  signInWithProvider: (providerName: string) => {
    const provider = AuthenticationProviders[providerName];

    return signInWithPopup(auth, provider);
  },

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  signOut: () => {
    return signOut(auth);
  },

  get currentUser() {
    return auth.currentUser;
  },
};
