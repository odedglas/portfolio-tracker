import { Holding, HoldingWithProfits, Quote } from '../types';

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
  summary: (holdings: HoldingWithProfits[]) =>
    holdings.reduce(
      (acc, holding) => {
        acc.shares += holding.shares;
        acc.profit += holding.profit.value;
        acc.currentValue += holding.currentValue;
        acc.invested += holding.invested;
        acc.realized += holding.realizedProfits ?? 0;
        acc.captialGains +=
          holding.profit.value - (holding.realizedProfits ?? 0);
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
        captialGains: 0,
        dailyChange: 0,
        fees: 0,
      }
    ),
};
