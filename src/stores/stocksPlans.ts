import { date as DateAPI } from 'quasar';
import { defineStore } from 'pinia';
import { StocksPlan } from 'app/shared/types';
import { getQuotes } from 'src/service/stocks';

const calculateStocksPlanVestingPeriods = (plan: StocksPlan) => {
  const { grantDate, vestingEndDate, vestingMonthsInterval } = plan;

  // Creates an array of vesting dates according to grantDate / endDate and vesting interval
  const vestingPeriods = [];

  let current = grantDate;
  while (current < vestingEndDate) {
    const nextVesting = DateAPI.addToDate(new Date(current), {
      months: vestingMonthsInterval,
    }).getTime();

    // Adds the next vesting period if it's in valid range of vesting end date.
    if (nextVesting <= vestingEndDate) {
      vestingPeriods.push(nextVesting);
    }
    current = nextVesting;
  }

  return vestingPeriods;
};

const isVestedPeriod = (
  cliffDate: number,
  terminationDate: number | undefined,
  periodDate: number
) => {
  // Period is under a cliff constraint
  if (periodDate <= cliffDate) {
    return false;
  }

  // Period is after termination date
  if (terminationDate && periodDate > terminationDate) {
    return false;
  }

  // Rather period is vested
  return Date.now() >= periodDate;
};

const calculateStocksPlanVestedPeriods = (
  plan: StocksPlan,
  vestingPeriods: number[]
) => {
  const { grantDate, cliff, terminationDate } = plan;

  const cliffDate = DateAPI.addToDate(new Date(grantDate), {
    years: cliff ? 1 : 0,
  });

  return vestingPeriods.filter((periodDate) =>
    isVestedPeriod(cliffDate.getTime(), terminationDate, periodDate)
  ).length;
};

const findNextVestingPeriod = (
  plan: StocksPlan,
  vestingPeriods: number[],
  vestedPeriods: number
) => {
  const { cliff, vestingMonthsInterval } = plan;

  const computedVestingPeriods =
    vestedPeriods + (cliff ? 12 / vestingMonthsInterval - 1 : 0);

  return computedVestingPeriods < vestingPeriods.length - 1
    ? vestingPeriods[computedVestingPeriods]
    : undefined;
};

const calculateVestedShares = (
  plan: StocksPlan,
  vestingPeriods: number[],
  vestedPeriods: number
) => {
  const { grantDate, vestingEndDate, amount } = plan;

  if (grantDate === vestingEndDate) {
    // Means its granted as fully vested.
    return amount;
  }

  return vestedPeriods > 0
    ? Math.round(amount * (vestedPeriods / vestingPeriods.length))
    : 0;
};

export const useStocksPlansStore = defineStore('stocksPlans', {
  state: (): { stocksPlans: StocksPlan[] } => ({
    stocksPlans: [],
  }),
  actions: {
    async setStocksPlans(plans: StocksPlan[]) {
      const { quoteResponse } = await getQuotes(
        plans.map((plan) => plan.ticker)
      );

      debugger;
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

        const potentialValue = planQuote
          ? planQuote.regularMarketPrice * plan.amount
          : 0;
        const sellableValue = planQuote
          ? planQuote.regularMarketPrice * vestedShares
          : 0;

        return {
          ...plan,
          vestingPeriods,
          vestedPeriods,
          nextVesting,
          lastVested,
          vested: vestedShares,
          potentialValue,
          sellableValue,
        };
      });
    },
  },
});
