import { defineStore } from 'pinia';
import portfolioAPI from 'src/service/portfolio';
import { Portfolio } from 'src/types';

export const usePortfolioStore = defineStore('portfolios', {
  state: (): { portfolios: Portfolio[] } => ({
    portfolios: [],
  }),
  actions: {
    async list() {
      this.portfolios = (await portfolioAPI.list()).sort((p1, p2) =>
        p1.createdAt < p2.createdAt ? -1 : 1
      );
    },
    remove(portfolioId: string) {
      this.portfolios = this.portfolios.filter(
        (portfolio) => portfolio.id !== portfolioId
      );
    },
    add(portfolio: Portfolio) {
      this.portfolios.push(portfolio);
    },
    update(portfolio: Portfolio) {
      const index = this.portfolios.findIndex(
        (current) => current.id === portfolio.id
      );

      this.portfolios[index] = portfolio;
    },
  },
});
