import { date as DateAPI } from 'quasar';
import { defineStore } from 'pinia';
import { StockPlanOrder, StocksPlan } from 'app/shared/types';
import { getQuotes } from 'src/service/stocks';
import {
  calculateStocksPlanVestedPeriods,
  calculateStocksPlanVestingPeriods,
  calculateVestedShares,
  findNextVestingPeriod,
  computePlanOrders,
} from 'src/service/stocksPlans';
import omit from 'lodash/omit';
import portfolioAPI from 'src/service/portfolio';
import { usePortfolioStore } from 'stores/portfolios';

export const useStocksPlansStore = defineStore('stocksPlans', {
  state: (): { stocksPlans: StocksPlan[] } => ({
    stocksPlans: [],
  }),
  actions: {
    async setStocksPlans(plans: StocksPlan[]) {
      const { quoteResponse } = await getQuotes(
        plans.map((plan) => plan.ticker)
      );

      this.stocksPlans = plans
        .map((plan) => {
          const planQuote = quoteResponse.result.find(
            (quote) => quote.symbol === plan.ticker
          );

          const vestingPeriods = calculateStocksPlanVestingPeriods(plan);
          const vestedPeriods = calculateStocksPlanVestedPeriods(
            plan,
            vestingPeriods
          );

          const lastVested =
            vestedPeriods > 0 ? vestingPeriods[vestedPeriods - 1] : undefined;
          const nextVesting = findNextVestingPeriod(
            plan,
            vestingPeriods,
            vestedPeriods
          );

          const vestedShares = calculateVestedShares(
            plan,
            vestingPeriods,
            vestedPeriods
          );

          const entitlement102Date = DateAPI.addToDate(plan.grantDate, {
            years: 2,
            days: 1,
          }).getTime();
          const planOrders = computePlanOrders(plan, entitlement102Date);

          const soldShares = planOrders.reduce(
            (acc, order) => acc + order.shares,
            0
          );

          const maxPlanShares = plan.amount - soldShares;
          const sellableShares = vestedShares - soldShares;

          const availableShares = plan.terminationDate
            ? sellableShares
            : maxPlanShares;

          const holdingMarketPrice = planQuote?.regularMarketPrice ?? 0;

          const potentialValue = holdingMarketPrice * availableShares;
          const sellableValue = holdingMarketPrice * sellableShares;

          return {
            ...plan,
            vestingPeriods,
            vestedPeriods,
            nextVesting,
            lastVested,
            vested: vestedShares,
            potentialValue,
            sellableValue,
            soldShares,
            availableShares,
            entitlement102Date,
            is102Entitled: Date.now() >= entitlement102Date,
            orders: planOrders,
            marketPrice: holdingMarketPrice,
          };
        })
        .sort((a, b) => a.grantDate - b.grantDate);
    },
    async updateStocksPlan(plan: StocksPlan, remove = false) {
      const rawPlan = omit(plan, [
        'lastVested',
        'nextVesting',
        'sellableValue',
        'potentialValue',
        'vestedPeriods',
        'vestingPeriods',
      ]);

      const portfolioStore = usePortfolioStore();

      const portfolio = portfolioStore.selectedPortfolio;
      if (!portfolio) {
        return;
      }

      const filteredPlans = portfolio.stocksPlans?.filter(
        (stocksPlan) => stocksPlan.identifier !== plan.identifier
      );

      portfolio.stocksPlans = [...(filteredPlans ?? [])];

      if (!remove) {
        portfolio.stocksPlans.push(rawPlan as StocksPlan);
      }

      await this.setStocksPlans(portfolio.stocksPlans);

      return portfolioAPI.update(portfolio, portfolio.id);
    },
    terminateStocksPlan(plan: StocksPlan) {
      plan.terminationDate = Date.now();
      return this.updateStocksPlan(plan);
    },
    updateStocksPlanOrder(plan: StocksPlan, order: StockPlanOrder) {
      const currentIndex = plan.orders?.findIndex((o) => o.id === order.id);

      if (currentIndex !== -1) {
        plan.orders[currentIndex] = order;
      } else {
        plan.orders = [...(plan.orders ?? []), order];
      }

      return this.updateStocksPlan(plan);
    },
    removeStocksPlanOrder(plan: StocksPlan, orderId: string) {
      plan.orders = plan.orders?.filter((order) => order.id !== orderId);

      return this.updateStocksPlan(plan);
    },
  },
});
