import { defineStore } from 'pinia';
import { holdingsTransformer } from 'app/shared/transformers';
import portfolioAPI from 'src/service/portfolio';
import {
  Deposit,
  Portfolio,
  PortfolioHistory,
  StocksPlan,
} from 'app/shared/types';
import { useTransactionsStore } from 'stores/transactions';
import { useHoldingsStore } from 'stores/holdings';
import { queries } from 'src/service/firebase/collections';
import { useStocksPlansStore } from 'stores/stocksPlans';

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
      const stocksPlansStore = useStocksPlansStore();
      localStorage.setItem(selectedPortfolioStorageKey, portfolioId);

      this.selectedPortfolioId = portfolioId;

      // TODO - This should trigger orchestrator "refresh" action.
      this.history = (await queries.getPortfolioHistory(portfolioId)).sort(
        (a, b) => a.date - b.date
      );

      await transactionsStore.list(portfolioId);

      if (this.selectedPortfolio) {
        this.selectedPortfolio.stocksPlans = [
          {
            id: '1',
            identifier: 'S433',
            grantDate: 1556841600000,
            vestingEndDate: 1620000000000,
            grantPrice: 45,
            vestingMonthsInterval: 3,
            ticker: 'FVR',
            name: 'Fiverr.',
            logoImage: 'https://s3-symbol-logo.tradingview.com/fiverr.svg',
            type: 'rsu',
            amount: 400,
            terminationDate: 1620000000000,
            cliff: false,
          },
          {
            id: '2',
            identifier: 'S3402',
            grantDate: 1556841600000,
            vestingEndDate: 1620000000000,
            grantPrice: 22,
            vestingMonthsInterval: 3,
            ticker: 'FVR',
            name: 'Fiverr.',
            logoImage: 'https://s3-symbol-logo.tradingview.com/fiverr.svg',
            type: 'rsu',
            amount: 1000,
            terminationDate: 1620000000000,
            cliff: false,
          },
          {
            id: '3',
            identifier: 'R55',
            grantDate: 1714694400000,
            vestingEndDate: 1844016929516,
            grantPrice: 233,
            vestingMonthsInterval: 3,
            ticker: 'MNDY',
            name: 'Monday.com',
            logoImage: 'https://s3-symbol-logo.tradingview.com/monday-com.svg',
            type: 'rsu',
            amount: 1250,
            cliff: true,
          },
        ];
      }

      await stocksPlansStore.setStocksPlans(
        this.selectedPortfolio?.stocksPlans ?? []
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
    async updateStocksPlan(plan: StocksPlan, remove = false) {
      const stocksPlansStore = useStocksPlansStore();

      const portfolio = this.selectedPortfolio;
      if (!portfolio) {
        return;
      }

      const filteredPlans = portfolio.stocksPlans?.filter(
        (stocksPlan) => stocksPlan.identifier !== plan.identifier
      );

      portfolio.stocksPlans = [...(filteredPlans ?? [])];

      if (!remove) {
        portfolio.stocksPlans.push(plan);
      }

      await stocksPlansStore.setStocksPlans(portfolio.stocksPlans);

      return portfolioAPI.update(portfolio, portfolio.id);
    },
  },
});
