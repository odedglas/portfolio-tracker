import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    loading: false,
  }),
  actions: {
    setLoading(isLoading: boolean) {
      this.loading = isLoading;
    },
    async emitLoadingTask<T>(task: () => Promise<T>) {
      this.setLoading(true);

      try {
        return await task();
      } finally {
        this.setLoading(false);
      }
    },
  },
});
