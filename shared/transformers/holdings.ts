import { Holding, HoldingsSummary, HoldingWithProfits, Quote } from '../types';

export const holdingsTransformer = {
  currentValue: (holding: Holding, quote: Quote) =>
    holding.shares * quote.regularMarketPrice,
  totalValue: (holding: Holding) => holding.shares * holding.avgPrice,
  profit: (holding: Holding, quote: Quote) => {
    const profitValue =
      holdingsTransformer.currentValue(holding, quote) -
      holdingsTransformer.totalValue(holding) +
      (holding?.realizedProfits ?? 0);

    return {
      value: profitValue,
      percent: Math.abs(profitValue / holding.invested),
    };
  },
  dailyChange: (holding: Holding, quote: Quote) => {
    const dailyChangeValue = quote.regularMarketChange * holding.shares;

    return {
      value: dailyChangeValue,
      percent: quote.regularMarketChangePercent / 100,
    };
  },
  withProfits: (
    holding: Holding,
    quotes: Record<string, Quote>
  ): HoldingWithProfits => {
    const lastTickerQuote = quotes[holding.ticker];

    const currentValue = holdingsTransformer.currentValue(
      holding,
      lastTickerQuote
    );
    const profit = holdingsTransformer.profit(holding, lastTickerQuote);
    const dailyChange = holdingsTransformer.dailyChange(
      holding,
      lastTickerQuote
    );

    return {
      ...holding,
      currentValue,
      profit,
      dailyChange,
    };
  },
  summary: (holdings: (HoldingWithProfits | Holding)[]): HoldingsSummary =>
    holdings.reduce(
      (acc, holding) => {
        const realizedProfit = holding.realizedProfits ?? 0;

        if (!('currentValue' in holding)) {
          acc.shares += holding.shares;
          acc.profit += realizedProfit;
          acc.realized += realizedProfit;
          acc.fees += holding?.fees ?? 0;

          return acc;
        }

        acc.shares += holding.shares;
        acc.profit += holding.profit.value;
        acc.currentValue += holding.currentValue;
        acc.invested += holding.invested;
        acc.realized += realizedProfit;
        acc.capitalGains += holding.profit.value - realizedProfit;
        acc.dailyChange += holding.dailyChange.value;
        acc.fees += holding?.fees ?? 0;

        return acc;
      },
      {
        shares: 0,
        profit: 0,
        currentValue: 0,
        invested: 0,
        realized: 0,
        capitalGains: 0,
        dailyChange: 0,
        fees: 0,
      }
    ),
};
