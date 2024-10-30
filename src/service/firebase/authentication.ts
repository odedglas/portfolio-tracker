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
  UserCredential,
} from 'firebase/auth';
import { useLoadingStore } from 'stores/loading';
import { FIREBASE_LOGIN_PROVIDERS } from 'app/shared/constants';
import userAPI from 'src/service/user';
import { auth } from './core';

const AuthenticationProviders = {
  [FIREBASE_LOGIN_PROVIDERS.GOOGLE]: new GoogleAuthProvider(),
  [FIREBASE_LOGIN_PROVIDERS.TWITTER]: new TwitterAuthProvider(),
  [FIREBASE_LOGIN_PROVIDERS.FACEBOOK]: new FacebookAuthProvider(),
};

/**
 * Executes a given authentication operations wrapped with loading store for splash screen.
 * @param authentication
 */
const authenticationWithLoading = (
  authentication: () => Promise<UserCredential>
) => {
  const loadingStore = useLoadingStore();

  return loadingStore.emitLoadingTask(async () => {
    const { user } = await authentication();

    if (user) {
      await userAPI.createAppUser(user);
    }
  });
};

export const authentication = {
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return auth.onAuthStateChanged(callback);
  },

  signInWithPassword: (email: string, password: string) => {
    return authenticationWithLoading(() =>
      signInWithEmailAndPassword(auth, email, password)
    );
  },
  signInWithProvider: (providerName: string) => {
    const provider = AuthenticationProviders[providerName];

    return authenticationWithLoading(() => signInWithPopup(auth, provider));
  },

  async signUp(email: string, password: string, displayName: string) {
    return authenticationWithLoading(async () => {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(credentials.user, {
        displayName,
      });

      return credentials;
    });
  },

  signOut: () => {
    return signOut(auth);
  },

  get authenticationUser() {
    return auth.currentUser;
  },

  get currentUser() {
    if (!this.authenticationUser) {
      throw new Error('Cannot access authentication user');
    }

    return this.authenticationUser;
  },
};
