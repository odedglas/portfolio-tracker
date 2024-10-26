import { defineStore } from 'pinia';
import { Notification } from 'app/shared/types';
import notificationsAPI from 'src/service/notifications';
import { useUserStore } from 'stores/user';

export const useNotificationsStore = defineStore('notifications', {
  state: (): { notifications: Notification[] } => ({
    notifications: [],
  }),
  actions: {
    async listNotifications() {
      const userStore = useUserStore();
      const notificationsOwner = userStore.user?.uid;

      if (!notificationsOwner) {
        return;
      }

      this.notifications = await notificationsAPI.list(notificationsOwner);
    },

    async markAsRead(notificationId: string, unread = false) {
      const notificationIndex = this.notifications.findIndex(
        (notification) => notification.id === notificationId
      );

      if (notificationIndex === -1) {
        return;
      }

      this.notifications[notificationIndex].unread = unread;

      await notificationsAPI.markRead(notificationId, unread);
    },
  },
});
