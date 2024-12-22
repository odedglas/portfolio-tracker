import { defineStore } from 'pinia';
import {
  holdingsTransformer,
  portfoliosTransformer,
} from 'app/shared/transformers';
import portfolioAPI from 'src/service/portfolio';
import { Deposit, Portfolio, PortfolioHistory } from 'app/shared/types';
import { useTransactionsStore } from 'stores/transactions';
import { useHoldingsStore } from 'stores/holdings';
import { queries } from 'src/service/firebase/collections';
import { useStocksPlansStore } from 'stores/stocksPlans';
import { useAllocationPlansStore } from 'stores/allocationPlans';

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
    history: PortfolioHistory[];
  } => ({
    portfolios: [],
    history: [],
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
      const deletedHoldings = holdingsStore.deletedHoldings;

      return {
        ...selected,
        ...holdingsDefaults,
        ...holdingsTransformer.summary([...holdings, ...deletedHoldings]),
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
    freeCashFlow(): number {
      const portfolio = this.selectedPortfolioWithHoldings;

      if (!portfolio) {
        return 0;
      }

      return portfoliosTransformer.cashFlow(portfolio);
    },
  },
  actions: {
    async selectPortfolio(portfolioId: string) {
      const transactionsStore = useTransactionsStore();
      const stocksPlansStore = useStocksPlansStore();
      const allocationPlanStore = useAllocationPlansStore();

      localStorage.setItem(selectedPortfolioStorageKey, portfolioId);

      this.selectedPortfolioId = portfolioId;

      // TODO - This should trigger orchestrator "refresh" action.
      this.history = (await queries.getPortfolioHistory(portfolioId)).sort(
        (a, b) => a.date - b.date
      );

      await transactionsStore.list(portfolioId);

      await stocksPlansStore.setStocksPlans(
        this.selectedPortfolio?.stocksPlans ?? []
      );

      allocationPlanStore.setAllocationsPlans(
        this.selectedPortfolio?.allocationPlans ?? []
      );
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
