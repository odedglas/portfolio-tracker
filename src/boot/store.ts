import { boot } from 'quasar/wrappers';
import { authentication } from 'src/service/firebase';
import { initializeMessaging } from 'src/service/firebase/messaging';
import userAPI from 'src/service/user';
import { useUserStore } from 'stores/user';
import { useNotificationsStore } from 'stores/notifications';

/**
 * Fetches application related data view upon successful authentication.
 */
export default boot(async () => {
  const userStore = useUserStore();
  const notificationsStore = useNotificationsStore();

  authentication.onAuthStateChanged(async (user) => {
    if (!user) {
      await userStore.setUser(null);
      return;
    }

    const appUser = await userAPI.get(user.uid);

    let freshToken = appUser.messagingToken;

    if (freshToken) {
      freshToken = await initializeMessaging((notification) =>
        notificationsStore.addNotification(notification)
      );

      // Ensures user token is freshly saved every time user object is set.
      if (appUser.messagingToken !== freshToken) {
        await userAPI.update(
          { messagingToken: freshToken, uid: user.uid },
          appUser.id
        );
      }
    }

    await userStore.setUser({
      ...user,
      ...appUser,
      messagingToken: freshToken,
    });
  });
});
