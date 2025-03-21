import { defineStore } from 'pinia';
import { Notification } from 'app/shared/types/entities';
import notificationsAPI from 'src/service/notifications';
import { useUserStore } from 'stores/user';
import { usePortfolioStore } from 'stores/portfolios';

export const useNotificationsStore = defineStore('notifications', {
  state: (): { notifications: Notification[] } => ({
    notifications: [],
  }),
  getters: {
    portfolioNotifications(state) {
      const portfolioStore = usePortfolioStore();

      return state.notifications
        .filter(
          (notification) =>
            notification.data.portfolioId ===
            portfolioStore.selectedPortfolio?.id
        )
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    unreadNotifications(): Notification[] {
      return this.portfolioNotifications.filter(
        (notification) => notification.unread
      );
    },
  },
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

    addNotification(notification: Notification) {
      this.notifications.push(notification);
    },
  },
});
