import { date as DateAPI } from 'quasar';
import { StockPlanOrder, StocksPlan } from 'app/shared/types';

export const getCliffDate = ({ cliff, grantDate }: StocksPlan) =>
  DateAPI.addToDate(new Date(grantDate), {
    years: cliff ? 1 : 0,
  }).getTime();

export const calculateStocksPlanVestingPeriods = (plan: StocksPlan) => {
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

export const isVestedPeriod = (
  cliffDate: number,
  terminationDate: number | undefined,
  periodDate: number
) => {
  const isCliffActive = Date.now() < cliffDate;

  // Period is under a cliff constraint
  if (isCliffActive && periodDate <= cliffDate) {
    return false;
  }

  // Period is after termination date
  if (terminationDate && periodDate > terminationDate) {
    return false;
  }

  // Rather period is vested
  return Date.now() >= periodDate;
};

export const canPeriodBeVested = (
  periodDate: number,
  cliffDate: number,
  terminationDate: number | undefined
) => {
  if (terminationDate && periodDate > terminationDate) {
    return false;
  }

  // If not terminated, determined by rather period date is before cliff date.
  return periodDate >= cliffDate;
};

export const calculateStocksPlanVestedPeriods = (
  plan: StocksPlan,
  vestingPeriods: number[]
) => {
  const { terminationDate } = plan;

  const cliffDate = getCliffDate(plan);

  return vestingPeriods.filter((periodDate) =>
    isVestedPeriod(cliffDate, terminationDate, periodDate)
  ).length;
};

export const findNextVestingPeriod = (
  plan: StocksPlan,
  vestingPeriods: number[],
  vestedPeriods: number
) => {
  const { vestingMonthsInterval } = plan;
  const cliffDate = getCliffDate(plan);
  const isCliffActive = Date.now() < cliffDate;

  const computedVestingPeriods =
    vestedPeriods + (isCliffActive ? 12 / vestingMonthsInterval - 1 : 0);

  return computedVestingPeriods < vestingPeriods.length - 1
    ? vestingPeriods[computedVestingPeriods]
    : undefined;
};

export const calculateVestedShares = (
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
    ? Math.floor(amount * (vestedPeriods / vestingPeriods.length))
    : 0;
};

export const buildVestingPeriodsDetails = (plan: StocksPlan) => {
  const { vestingPeriods = [], amount, terminationDate } = plan;
  const vestingPeriodsAmount = vestingPeriods.length;
  const cliffDate = getCliffDate(plan);

  let carriedAmount = 0;
  let totalVested = 0;
  return vestingPeriods.map((period, index) => {
    const isLast = index === vestingPeriodsAmount - 1;
    const canBeVested = canPeriodBeVested(period, cliffDate, terminationDate);

    let periodAmount =
      vestingPeriodsAmount > 0 ? amount / vestingPeriodsAmount : amount;

    if (!canBeVested) {
      carriedAmount += periodAmount;
    } else {
      periodAmount += carriedAmount;
      totalVested += periodAmount;

      carriedAmount = 0;
    }

    if (isLast && totalVested <= amount) {
      const delta = amount - totalVested;
      totalVested += delta;
      periodAmount += delta;
    }

    return {
      period,
      disabled: !canBeVested,
      amount: canBeVested ? Math.floor(periodAmount) : 0,
      totalVested: Math.round(totalVested),
    };
  });
};

const planTaxMapping = {
  espp: {
    base: () => 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    capital: (_: boolean, isAbove102Entitlement: boolean) =>
      isAbove102Entitlement ? 0.25 : 0.48,
  },
  rsu: {
    base: (isTerminated: boolean) => (isTerminated ? 0.62 : 0.48),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    capital: (isTerminated: boolean, _: boolean) =>
      isTerminated ? 0.62 : 0.25,
  },
} as const;

export const computePlanOrderGains = (
  plan: StocksPlan,
  order: StockPlanOrder,
  entitlement102Date: number
) => {
  const { type, terminationDate } = plan;
  const { date: orderDate, price: orderPrice, shares } = order;

  const isTerminated = terminationDate ? orderDate > terminationDate : false;
  const isAbove102Entitlement = orderDate > entitlement102Date;

  const baseValue = plan.grantPrice * shares;
  const capitalGain = (orderPrice - plan.grantPrice) * shares;
  const totalValue = orderPrice * shares;

  const baseValueTax = planTaxMapping[type].base(isTerminated);
  const capitalGainTax = planTaxMapping[type].capital(
    isTerminated,
    isAbove102Entitlement
  );
  const taxComponent = baseValue * baseValueTax + capitalGain * capitalGainTax;
  const netGain = totalValue - taxComponent;
  const profitPercent = (capitalGain / baseValue) * 100;

  return {
    baseValue,
    capitalGain,
    netGain,
    taxComponent,
    profitPercent,
    totalValue,
    isAbove102Entitlement,
  };
};

export const computePlanOrders = (
  plan: StocksPlan,
  entitlement102Date: number
) => {
  const { orders = [] } = plan;

  // Compute each order it's captial tax gain
  return orders.map((order) => ({
    ...order,
    ...computePlanOrderGains(plan, order, entitlement102Date),
  }));
};
