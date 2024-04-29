import { boot } from 'quasar/wrappers';
import { loadIcons } from '../service/icons';

/**
 * Initialize Firebase application.
 */
export default boot(async () => {
  await loadIcons();
});
