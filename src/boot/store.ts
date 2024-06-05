import { boot } from 'quasar/wrappers';
import { authentication } from 'src/service/firebase';
import { useUserStore } from 'stores/user';

/**
 * Fetches application related data view upon successful authentication.
 */
export default boot(async () => {
  const userStore = useUserStore();

  authentication.onAuthStateChanged(async (user) => {
    userStore.setUser(user);
  });
});
