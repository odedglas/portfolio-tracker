import { defineStore } from 'pinia';
import portfolioAPI from 'src/service/portfolio';
import { Portfolio } from 'src/types';

const selectedPortfolioStorageKey = 'selected_portfolio_id';

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
    selectPortfolio(portfolioId: string) {
      localStorage.setItem('selectedPortfolioStorageKey', portfolioId);
      this.selectedPortfolioId = portfolioId;
    },
    async list() {
      const persisted = localStorage.getItem('selectedPortfolioStorageKey');

      if (loadedOnce) {
        this.selectPortfolio(
          persisted ?? this.selectedPortfolioId ?? this.portfolios[0]?.id
        );
        return this.portfolios;
      }

      this.portfolios = await portfolioAPI.list();

      const portfolioToSelect = persisted
        ? this.portfolios.find((p) => p.id === persisted)!
        : this.portfolios[0];

      this.selectPortfolio(portfolioToSelect.id);

      localStorage.setItem(
        'selectedPortfolioStorageKey',
        this.selectedPortfolioId as string
      );

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
