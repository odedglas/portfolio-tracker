import { defineStore } from 'pinia';

export const useFeaturesStore = defineStore('features', {
  state: (): { stealthMode: boolean } => ({
    stealthMode: false,
  }),
  actions: {
    toggleStealthMode() {
      this.stealthMode = !this.stealthMode;
    },
  },
});
