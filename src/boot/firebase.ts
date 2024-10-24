import { boot } from 'quasar/wrappers';
import { initializeFirebaseApp } from '../service/firebase';
import { listenForMessages } from 'src/service/firebase/messaging';

/**
 * Initialize Firebase application.
 */
export default boot(async () => {
  await initializeFirebaseApp();

  await listenForMessages();
});
