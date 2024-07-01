import { defineStore } from 'pinia';
import portfolioAPI from 'src/service/portfolio';
import { transformer as holdingsTransformer } from 'src/service/holdings';
import { Deposit, Portfolio } from 'app/shared/types';
import { useTransactionsStore } from 'stores/transactions';
import { useHoldingsStore } from 'stores/holdings';

const selectedPortfolioStorageKey = 'selected_portfolio_id';

let loadedOnce = false;

const holdingsDefaults = {
  shares: 0,
  currentValue: 0,
  profit: 0,
  invested: 0,
  realized: 0,
  captialGains: 0,
};

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
    selectedPortfolioWithHoldings(): Portfolio | undefined {
      const selected = this.selectedPortfolio;
      const holdingsStore = useHoldingsStore();

      if (!selected) return undefined;

      const holdings = holdingsStore.portfolioHoldings;

      return {
        ...selected,
        ...holdingsDefaults,
        ...holdingsTransformer.summary(holdings),
      };
    },
    portfoliosWithHoldings(state): Portfolio[] {
      const holdingsStore = useHoldingsStore();
      const portfoliosHoldingMap = holdingsStore.portfoliosHoldingsMap;

      return state.portfolios.map((portfolio) => {
        const portfolioHoldings = portfoliosHoldingMap[portfolio.id];

        return {
          ...portfolio,
          ...holdingsDefaults,
          ...portfolioHoldings,
        };
      });
    },
  },
  actions: {
    async selectPortfolio(portfolioId: string) {
      const transactionsStore = useTransactionsStore();
      localStorage.setItem(selectedPortfolioStorageKey, portfolioId);

      this.selectedPortfolioId = portfolioId;

      await transactionsStore.list(portfolioId);
    },
    async list() {
      const persisted = localStorage.getItem(selectedPortfolioStorageKey);

      if (loadedOnce) {
        await this.selectPortfolio(
          persisted ?? this.selectedPortfolioId ?? this.portfolios[0]?.id
        );
        return this.portfolios;
      }

      this.portfolios = await portfolioAPI.list();

      const portfolioToSelect =
        this.portfolios.find((p) => p.id === persisted) ?? this.portfolios[0];

      if (portfolioToSelect) {
        await this.selectPortfolio(portfolioToSelect.id);

        localStorage.setItem(
          selectedPortfolioStorageKey,
          this.selectedPortfolioId as string
        );

        loadedOnce = true;
      }

      return this.portfolios;
    },
    remove(portfolioId: string) {
      this.portfolios = this.portfolios.filter(
        (portfolio) => portfolio.id !== portfolioId
      );

      if (this.portfolios.length === 0) {
        this.selectedPortfolioId = undefined;
        localStorage.removeItem(selectedPortfolioStorageKey);
        return;
      }

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
    async updateDeposit(deposit: Deposit, index: number) {
      const portfolio = this.selectedPortfolio;
      if (!portfolio) {
        return;
      }

      portfolio.deposits[index] = deposit;

      return portfolioAPI.update(portfolio, portfolio.id);
    },
    async deleteDeposit(index: number) {
      const portfolio = this.selectedPortfolio;
      if (!portfolio) {
        return;
      }

      portfolio.deposits.splice(index, 1);

      return portfolioAPI.update(portfolio, portfolio.id);
    },
  },
});
