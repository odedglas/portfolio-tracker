import { Portfolio } from '../types';

export const portfoliosTransformer = {
  initialDeposit(portfolio: Portfolio) {
    return portfolio.deposits.find((deposit) => deposit.initial)?.value ?? 0;
  },
  depositsValue(portfolio: Portfolio) {
    return portfolio.deposits
      .filter((d) => d.type !== 'balance')
      .reduce((amount, deposit) => amount + deposit.value, 0);
  },
  depositManualBalance(portfolio: Portfolio) {
    return portfolio.deposits
      .filter((d) => d.type === 'balance')
      .reduce((amount, deposit) => amount + deposit.value, 0);
  },
  cashFlow(portfolio: Portfolio) {
    return (
      portfoliosTransformer.depositsValue(portfolio) -
      portfolio.invested +
      portfoliosTransformer.depositManualBalance(portfolio)
    );
  },
  portfolioKPIS(portfolio: Portfolio) {
    const depositsValue = portfoliosTransformer.depositsValue(portfolio);
    const cashFlow = portfoliosTransformer.cashFlow(portfolio);

    const target = {
      value: portfolio.target,
      percentage: (portfolio.currentValue + cashFlow) / portfolio.target,
    };

    const profit = {
      value: portfolio.profit,
      percentage: portfolio.invested ? portfolio.profit / depositsValue : 0,
    };

    const dailyChange = {
      value: portfolio.dailyChange ?? 0,
      percentage: portfolio.dailyChange
        ? portfolio.dailyChange / depositsValue
        : 0,
    };

    return { target, profit, dailyChange };
  },
};
