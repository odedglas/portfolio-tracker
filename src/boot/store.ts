import { boot } from 'quasar/wrappers';
import { authentication } from 'src/service/firebase';
import { initializeMessaging } from 'src/service/firebase/messaging';
import userAPI from 'src/service/user';
import { useUserStore } from 'stores/user';

/**
 * Fetches application related data view upon successful authentication.
 */
export default boot(async () => {
  const userStore = useUserStore();

  authentication.onAuthStateChanged(async (user) => {
    if (!user) {
      await userStore.setUser(null);
      return;
    }

    const appUser = await userAPI.get(user.uid);

    let freshToken = appUser.messagingToken;

    if (freshToken) {
      freshToken = await initializeMessaging();
    }

    await userStore.setUser({
      ...user,
      ...appUser,
      messagingToken: freshToken,
    });
  });
});
