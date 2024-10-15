import { date as DateAPI } from 'quasar';
import { defineStore } from 'pinia';
import { StocksPlan } from 'app/shared/types';
import { getQuotes } from 'src/service/stocks';
import {
  calculateStocksPlanVestedPeriods,
  calculateStocksPlanVestingPeriods,
  calculateVestedShares,
  findNextVestingPeriod,
  computePlanOrders,
} from 'src/service/stocksPlans';

export const useStocksPlansStore = defineStore('stocksPlans', {
  state: (): { stocksPlans: StocksPlan[] } => ({
    stocksPlans: [],
  }),
  actions: {
    async setStocksPlans(plans: StocksPlan[]) {
      const { quoteResponse } = await getQuotes(
        plans.map((plan) => plan.ticker)
      );

      this.stocksPlans = plans.map((plan) => {
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
      });
    },
  },
});
