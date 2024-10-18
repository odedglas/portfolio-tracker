import { INSIGHT_TYPE } from 'app/shared/constants';
import { Holding, Quote, PortfolioInsight } from 'app/shared/types';

type CalculateInsightOptions = {
  holding: Holding;
  quote: Quote;
};

type InsightCalculator = {
  getInsight: (
    options: CalculateInsightOptions
  ) => PortfolioInsight | undefined;
};

const fiftyTwoWeekHighInsightCalculator = {
  getInsight: (
    options: CalculateInsightOptions
  ): PortfolioInsight | undefined => {
    const { holding, quote } = options;
    const { fiftyTwoWeekHigh, regularMarketPrice, twoHundredDayAverage } =
      quote;

    if (regularMarketPrice >= fiftyTwoWeekHigh) {
      // Market price is above 52 week high
      return undefined;
    }

    if (regularMarketPrice <= twoHundredDayAverage) {
      // Current price is below 200 day average
      return undefined;
    }

    const fiftyTwoWeekHighDelta = fiftyTwoWeekHigh - regularMarketPrice;
    const deltaPercent = fiftyTwoWeekHighDelta / fiftyTwoWeekHigh;

    if (deltaPercent < 0.15 || deltaPercent >= 0.35) {
      return undefined;
    }

    return {
      title: `${holding.name} is down ${deltaPercent} from it's 52 week high`,
      type: INSIGHT_TYPE.BELOW_52_WEEK_HIGH,
      inputs: {
        fiftyTwoWeekHigh,
        fiftyTwoWeekHighDelta,
        deltaPercent,
        regularMarketPrice,
        twoHundredDayAverage,
      },
      holding,
    };
  },
};

const fiftyTwoWeekLowInsightCalculator = {
  getInsight: (
    options: CalculateInsightOptions
  ): PortfolioInsight | undefined => {
    const { holding, quote } = options;
    const { fiftyTwoWeekLow, regularMarketPrice } = quote;

    const delta = regularMarketPrice - fiftyTwoWeekLow;
    const deltaPercent = delta / fiftyTwoWeekLow;

    if (deltaPercent > 0.2) {
      // Price is more than 20% above 52 week low
      return undefined;
    }

    return {
      title: `${holding.name} is only ${deltaPercent} above it's 52 week low`,
      type: INSIGHT_TYPE.NEAR_52_WEEK_LOW,
      inputs: {
        fiftyTwoWeekLow,
        delta,
        regularMarketPrice,
      },
      holding,
    };
  },
};

const highShortInterestInsightCalculator = {
  getInsight: (
    options: CalculateInsightOptions
  ): PortfolioInsight | undefined => {
    const { holding, quote } = options;

    const { shortRatio } = quote;

    if (!shortRatio || shortRatio < 10) {
      return undefined;
    }

    return {
      title: `${holding.name} has a high short interest`,
      type: INSIGHT_TYPE.HIGH_SHORT_INTEREST,
      inputs: {
        shortRatio,
      },
      holding,
    };
  },
};

const MOVING_AVERAGE_THRESHOLD = 0.025;

const movingAveragesInsightCalculator = {
  getInsight: (
    options: CalculateInsightOptions
  ): PortfolioInsight | undefined => {
    const { holding, quote } = options;

    const { regularMarketPrice, fiftyDayAverage, twoHundredDayAverage } = quote;

    const fiftyDayDelta = regularMarketPrice - fiftyDayAverage;
    const fiftyDayDeltaPercent = fiftyDayDelta / fiftyDayAverage;

    if (fiftyDayDeltaPercent > MOVING_AVERAGE_THRESHOLD) {
      return undefined;
    }

    if (
      fiftyDayDeltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      fiftyDayDeltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return {
        title: `${holding.name} is near it's 50 days average`,
        type: INSIGHT_TYPE.NEAR_MOVING_AVERAGES,
        inputs: {
          regularMarketPrice,
          isAbove: fiftyDayDelta > 0,
          fiftyDayAverage,
          fiftyDayDeltaPercent,
        },
        holding,
      };
    }

    const twoHundredDayDelta = regularMarketPrice - twoHundredDayAverage;
    const twoHundredDayDeltaPercent = twoHundredDayDelta / twoHundredDayAverage;

    if (
      twoHundredDayDeltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      twoHundredDayDeltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return {
        title: `${holding.name} is near it's 200 days average`,
        type: INSIGHT_TYPE.NEAR_MOVING_AVERAGES,
        inputs: {
          regularMarketPrice,
          twoHundredDayAverage,
          twoHundredDayDeltaPercent,
          isAbove: twoHundredDayDelta > 0,
        },
        holding,
      };
    }

    return undefined;
  },
};

const insightsCalculators: InsightCalculator[] = [
  fiftyTwoWeekHighInsightCalculator,
  fiftyTwoWeekLowInsightCalculator,
  highShortInterestInsightCalculator,
  movingAveragesInsightCalculator,
];

export const calculateInsights = (
  holding: Holding,
  quote: Quote
): PortfolioInsight[] =>
  insightsCalculators
    .map((calculator) => {
      return calculator.getInsight({ holding, quote });
    })
    .filter(Boolean) as PortfolioInsight[];
