import { boot } from 'quasar/wrappers';
import { initializeFirebaseApp } from '../service/firebase';

export default boot(() => {
  initializeFirebaseApp();
});
