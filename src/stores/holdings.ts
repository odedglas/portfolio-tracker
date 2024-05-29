import { defineStore } from 'pinia';
import holdingsAPI from 'src/service/holdings';
import { Holding, Transaction } from 'src/types';

interface HoldingsStoreState {
  holding: Holding[];
  loading: boolean;
  empty: boolean;
}

export const useHoldingsStore = defineStore('holdings', {
  state: (): HoldingsStoreState => ({
    holding: [],
    loading: false,
    empty: false,
  }),
  actions: {
    async get(portfolioId: string) {
      this.loading = true;

      if (!portfolioId) {
        throw Error('Cannot get holdings without Portfolio id');
      }

      this.holding = await holdingsAPI.get(portfolioId);

      if (!this.holding) {
        this.loading = false;
        this.empty = true;
        return this.holding;
      }

      this.loading = false;

      return this.holding;
    },
    async create(transaction: Transaction) {
      const { portfolioId, shares, ticker, name, logoImage } = transaction;

      await holdingsAPI.update({
        portfolioId,
        shares,
        ticker,
        name,
        logoImage,
      });

      this.empty = false;
    },
  },
});
