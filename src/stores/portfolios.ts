import { defineStore } from 'pinia';
import portfolioAPI from 'src/service/portfolio';
import { Portfolio } from 'src/types';

let loadedOnce = false;

export const usePortfolioStore = defineStore('portfolios', {
  state: (): {
    portfolios: Portfolio[];
    selectedPortfolioId: string | undefined;
  } => ({
    portfolios: [],
    selectedPortfolioId: undefined,
  }),
  getters: {
    selectedPortfolio(state) {
      return state.portfolios.find(
        (portfolio) => portfolio.id === state.selectedPortfolioId
      );
    },
  },
  actions: {
    async list() {
      if (loadedOnce) {
        return;
      }

      this.portfolios = (await portfolioAPI.list()).sort((p1, p2) =>
        p1.createdAt < p2.createdAt ? -1 : 1
      );

      this.selectedPortfolioId = this.portfolios[0]?.id; // TODO - Add localStorage persistence layer

      loadedOnce = true;

      return this.portfolios;
    },
    remove(portfolioId: string) {
      this.portfolios = this.portfolios.filter(
        (portfolio) => portfolio.id !== portfolioId
      );

      const selectedPortfolio = this.portfolios.find(
        (portfolio) => portfolio.id === this.selectedPortfolioId
      );
      if (!selectedPortfolio) {
        this.selectedPortfolioId = this.portfolios[0]?.id;
      }
    },
    add(portfolio: Portfolio) {
      this.portfolios.push(portfolio);

      if (!this.selectedPortfolioId) {
        this.selectedPortfolioId = portfolio.id;
      }
    },
    update(portfolio: Portfolio) {
      const index = this.portfolios.findIndex(
        (current) => current.id === portfolio.id
      );

      this.portfolios[index] = portfolio;
    },
  },
});
