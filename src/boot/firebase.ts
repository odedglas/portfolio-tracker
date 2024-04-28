import { boot } from 'quasar/wrappers';
import { initializeFirebaseApp } from '../service/firebase';

/**
 * Initialize Firebase application.
 */
export default boot(() => {
  initializeFirebaseApp();
});
