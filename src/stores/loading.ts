import { defineStore } from 'pinia';

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
        const [taskResult] = await Promise.all([task(), wait(500)]);

        return taskResult;
      } finally {
        this.setLoading(false);
      }
    },
  },
});
