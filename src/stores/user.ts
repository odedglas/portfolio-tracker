import { format } from 'quasar';
import { defineStore } from 'pinia';
import { User } from 'app/shared/types';
import userAPI from 'src/service/user';
import { requestMessagingPermission } from 'src/service/firebase/messaging';
import { useNotificationsStore } from 'stores/notifications';

const { capitalize } = format;

export const useUserStore = defineStore('user', {
  state: (): { user: User | null } => ({
    user: null,
  }),
  getters: {
    displayName(state) {
      const userDisplayNameParts = state.user?.displayName?.split(' ') || [];

      return userDisplayNameParts.map(capitalize).join(' ');
    },
    initials: (state) => {
      const userDisplayNameParts = state.user?.displayName?.split(' ') || [];

      return userDisplayNameParts
        .map((part) => part.split('')[0].toUpperCase())
        .join('');
    },
  },
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
