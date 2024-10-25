import { defineStore } from 'pinia';
import { User } from 'app/shared/types';
import userAPI from 'src/service/user';
import { requestMessagingPermission } from 'src/service/firebase/messaging';
import { subscribeToPortfolioNotifications } from 'src/service/firebase/cloudRequest';

export const useUserStore = defineStore('user', {
  state: (): { user: User | null } => ({
    user: null,
  }),
  actions: {
    async setUser(user: User | null) {
      this.user = user;

      // Ensures user token is freshly saved every time user object is set.
      if (user?.messagingToken) {
        await userAPI.update(
          { messagingToken: user.messagingToken, uid: user.uid },
          user.id
        );
      }
    },
    async toggleNotificationEnabledSetting() {
      if (!this.user) {
        return;
      }

      this.user.settings.notificationsEnabled =
        !this.user.settings.notificationsEnabled;

      const updatePayload: Partial<User> = {
        uid: this.user.uid,
        settings: {
          notificationsEnabled: this.user.settings.notificationsEnabled,
        },
      };

      // Subscribe to Firebase FCM
      if (
        this.user.settings.notificationsEnabled &&
        !this.user.messagingToken
      ) {
        updatePayload.messagingToken = await requestMessagingPermission();
      }

      await userAPI.update(updatePayload, this.user.id);
      await subscribeToPortfolioNotifications(this.user.uid);
    },
  },
});
