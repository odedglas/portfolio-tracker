import { INSIGHT_TYPE } from 'app/shared/constants';
import { Holding, Quote, PortfolioInsight } from 'app/shared/types';

type CalculateInsightOptions = {
  holding: Holding;
  quote: Quote;
};

type InsightCalculator = {
  getInsight: (
    options: CalculateInsightOptions
  ) => Omit<PortfolioInsight, 'holding'> | undefined;
};

const fiftyTwoWeekHighInsightCalculator = {
  getInsight: (options: CalculateInsightOptions) => {
    const { quote } = options;
    const {
      fiftyTwoWeekHigh,
      regularMarketPrice,
      twoHundredDayAverage,
      fiftyDayAverage,
    } = quote;

    if (regularMarketPrice >= fiftyTwoWeekHigh) {
      // Market price is above 52 week high
      return undefined;
    }

    if (
      regularMarketPrice <= twoHundredDayAverage ||
      regularMarketPrice <= fiftyDayAverage
    ) {
      // Current price is below 200/50 day's average
      return undefined;
    }

    const fiftyTwoWeekHighDelta = fiftyTwoWeekHigh - regularMarketPrice;
    const deltaPercent = fiftyTwoWeekHighDelta / fiftyTwoWeekHigh;

    if (deltaPercent < 0.15 || deltaPercent >= 0.35) {
      return undefined;
    }

    return {
      type: INSIGHT_TYPE.BELOW_52_WEEK_HIGH,
      inputs: {
        fiftyTwoWeekHigh,
        fiftyTwoWeekHighDelta,
        deltaPercent,
        regularMarketPrice,
        twoHundredDayAverage,
      },
      tags: [
        { name: 'fiftyTwoWeekHigh', value: fiftyTwoWeekHigh },
        { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
      ],
    };
  },
};

const fiftyTwoWeekLowInsightCalculator = {
  getInsight: (options: CalculateInsightOptions) => {
    const { quote } = options;
    const { fiftyTwoWeekLow, regularMarketPrice } = quote;

    const delta = regularMarketPrice - fiftyTwoWeekLow;
    const deltaPercent = delta / fiftyTwoWeekLow;

    if (deltaPercent > 0.02) {
      // Price is more than 2% above 52 week low
      return undefined;
    }

    return {
      type: INSIGHT_TYPE.NEAR_52_WEEK_LOW,
      inputs: {
        fiftyTwoWeekLow,
        delta,
        deltaPercent,
        regularMarketPrice,
      },
      tags: [{ name: 'fiftyTwoWeekLow', value: fiftyTwoWeekLow }],
    };
  },
};

const highShortInterestInsightCalculator = {
  getInsight: (options: CalculateInsightOptions) => {
    const SHORT_INTEREST_THRESHOLD = 10;

    const { quote } = options;

    const { shortRatio } = quote;

    if (!shortRatio || shortRatio < SHORT_INTEREST_THRESHOLD) {
      return undefined;
    }

    const deltaPercent =
      (shortRatio - SHORT_INTEREST_THRESHOLD) / SHORT_INTEREST_THRESHOLD;

    return {
      type: INSIGHT_TYPE.HIGH_SHORT_INTEREST,
      inputs: {
        shortRatio,
        threshold: [SHORT_INTEREST_THRESHOLD, '%'].join(''),
        deltaPercent,
      },
    };
  },
};

const MOVING_AVERAGE_THRESHOLD = 0.025;

const movingAveragesInsightCalculator = {
  getInsight: (
    options: CalculateInsightOptions
  ): Omit<PortfolioInsight, 'holding'> | undefined => {
    const { quote } = options;

    const { regularMarketPrice, fiftyDayAverage, twoHundredDayAverage } = quote;

    const twoHundredDayDelta = regularMarketPrice - twoHundredDayAverage;
    const twoHundredDayDeltaPercent = twoHundredDayDelta / twoHundredDayAverage;

    if (
      twoHundredDayDeltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      twoHundredDayDeltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return {
        type: INSIGHT_TYPE.NEAR_MOVING_AVERAGES,
        inputs: {
          regularMarketPrice,
          twoHundredDayAverage,
          deltaPercent: twoHundredDayDeltaPercent,
          isAbove: twoHundredDayDelta > 0,
          movingAverageDays: 200,
        },
        tags: [
          { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
          { name: 'fiftyDayAverage', value: fiftyDayAverage },
        ],
      };
    }

    const fiftyDayDelta = regularMarketPrice - fiftyDayAverage;
    const fiftyDayDeltaPercent = fiftyDayDelta / fiftyDayAverage;

    if (
      fiftyDayDeltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      fiftyDayDeltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return {
        type: INSIGHT_TYPE.NEAR_MOVING_AVERAGES,
        inputs: {
          regularMarketPrice,
          isAbove: fiftyDayDelta > 0,
          fiftyDayAverage,
          deltaPercent: fiftyDayDeltaPercent,
          movingAverageDays: 50,
        },
        tags: [
          { name: 'fiftyDayAverage', value: fiftyDayAverage },
          { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
        ],
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
      const insight = calculator.getInsight({ holding, quote });

      if (!insight) {
        return undefined;
      }

      const defaultTags: PortfolioInsight['tags'] = [
        { name: 'marketPrice', value: quote.regularMarketPrice },
      ];

      return {
        ...insight,
        holding,
        tags: [...defaultTags, ...(insight.tags ?? [])],
      };
    })
    .filter(Boolean) as PortfolioInsight[];
