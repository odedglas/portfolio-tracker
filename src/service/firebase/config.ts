export const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSANGING_SENDER_ID,
  appId: process.env.APP_ID,
};

console.log('************* firebase', firebaseConfig);
