import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getMessaging, Messaging } from 'firebase/messaging';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let messaging: Messaging;
let functions: Functions;

// Initialize Firebase
export const initializeFirebaseApp = async () => {
  firebaseApp = initializeApp(firebaseConfig);

  auth = getAuth(firebaseApp);

  firestore = getFirestore(firebaseApp);

  messaging = getMessaging(firebaseApp);

  functions = getFunctions(firebaseApp);

  await auth.authStateReady();
};

export { firebaseApp, auth, firestore, messaging, functions };
