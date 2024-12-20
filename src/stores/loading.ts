import { defineStore } from 'pinia';

/**
 * Waits a given milliseconds until resolved.
 * @param ms
 */
const wait = (ms = 500) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('done');
    }, ms);
  });

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
        const [taskResult] = await Promise.all([task(), wait(1000)]);

        return taskResult;
      } finally {
        this.setLoading(false);
      }
    },
  },
});
