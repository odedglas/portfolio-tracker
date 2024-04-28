import { initializeApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;

// Initialize Firebase
export const initializeFirebaseApp = () => {
  firebaseApp = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
};

export { firebaseApp };
