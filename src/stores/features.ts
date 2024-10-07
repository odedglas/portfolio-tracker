import { defineStore } from 'pinia';

export const useFeaturesStore = defineStore('features', {
  state: (): { stealthMode: boolean } => ({
    stealthMode: localStorage.getItem('features.stealthMode') === 'true',
  }),
  actions: {
    toggleStealthMode() {
      this.stealthMode = !this.stealthMode;

      localStorage.setItem('features.stealthMode', this.stealthMode.toString());
    },
  },
});
