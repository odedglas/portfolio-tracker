import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;

// Initialize Firebase
export const initializeFirebaseApp = async () => {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);

  await auth.authStateReady();

  console.log(auth.currentUser);
};

export { firebaseApp, auth };
