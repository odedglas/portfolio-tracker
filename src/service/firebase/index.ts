import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;

// Initialize Firebase
export const initializeFirebaseApp = () => {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
};

export { firebaseApp, auth };
