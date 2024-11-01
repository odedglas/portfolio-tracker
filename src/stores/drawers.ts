import { defineStore } from 'pinia';

export const useDrawersStore = defineStore('drawers', {
  state: (): { notificationsOpen: boolean; userProfileOpen: boolean } => ({
    notificationsOpen: false,
    userProfileOpen: false,
  }),
  actions: {
    toggleNotifications(toggle?: boolean) {
      toggle ??= !this.notificationsOpen;

      this.notificationsOpen = toggle;
    },
    toggleUserProfile(toggle?: boolean) {
      toggle ??= !this.userProfileOpen;

      this.userProfileOpen = toggle;
    },
  },
});
