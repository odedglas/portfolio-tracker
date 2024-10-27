import { defineStore } from 'pinia';
import { User } from 'app/shared/types';
import userAPI from 'src/service/user';
import { requestMessagingPermission } from 'src/service/firebase/messaging';
import { useNotificationsStore } from 'stores/notifications';

export const useUserStore = defineStore('user', {
  state: (): { user: User | null } => ({
    user: null,
  }),
  actions: {
    async setUser(user: User | null) {
      this.user = user;
    },
    async toggleNotificationEnabledSetting() {
      const notificationsStore = useNotificationsStore();

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
        updatePayload.messagingToken = await requestMessagingPermission(
          (notification) => notificationsStore.addNotification(notification)
        );
      }

      await userAPI.update(updatePayload, this.user.id);
    },
  },
});
