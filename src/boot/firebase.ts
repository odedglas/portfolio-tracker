import { boot } from 'quasar/wrappers';
import { initializeFirebaseApp } from '../service/firebase';

/**
 * Initialize Firebase application end.
 */
export default boot(() => {
  initializeFirebaseApp();
});
