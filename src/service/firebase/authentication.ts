import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  User,
} from 'firebase/auth';
import { auth } from './core';
import { FIREBASE_LOGIN_PROVIDERS } from 'src/constants';

const AuthenticationProviders = {
  [FIREBASE_LOGIN_PROVIDERS.GOOGLE]: new GoogleAuthProvider(),
  [FIREBASE_LOGIN_PROVIDERS.TWITTER]: new TwitterAuthProvider(),
  [FIREBASE_LOGIN_PROVIDERS.FACEBOOK]: new FacebookAuthProvider(),
};

export const authentication = {
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return auth.onAuthStateChanged(callback);
  },

  signInWithPassword: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  signInWithProvider: (providerName: string) => {
    const provider = AuthenticationProviders[providerName];

    return signInWithPopup(auth, provider);
  },

  async signUp(email: string, password: string, displayName: string) {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(user, {
      displayName,
    });
  },

  signOut: () => {
    return signOut(auth);
  },

  get currentUser() {
    return auth.currentUser;
  },
};
