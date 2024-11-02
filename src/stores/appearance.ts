import { defineStore } from 'pinia';
import { Platform } from 'quasar';

export const useAppearanceStore = defineStore('appearance', {
  state: (): { borderedCards: boolean } => ({
    borderedCards: Platform.is?.desktop ?? false
  }),
});
