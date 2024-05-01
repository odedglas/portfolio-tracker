import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    loading: false,
  }),
  actions: {
    setLoading(isLoading: boolean) {
      this.loading = isLoading;
    },
    async emitLoadingTask(task: () => Promise<unknown>) {
      this.setLoading(true);

      try {
        await task();
      } finally {
        this.setLoading(false);
      }
    },
  },
});
