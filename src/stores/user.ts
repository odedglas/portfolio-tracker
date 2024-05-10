import { defineStore } from 'pinia';
import { User } from 'firebase/auth';

export const useUserStore = defineStore('user', {
  state: (): { user: User | null } => ({
    user: null,
  }),
  actions: {
    setUser(user: User | null) {
      this.user = user;
    },
  },
});
