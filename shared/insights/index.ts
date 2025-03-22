import { INSIGHT_TYPE } from '../constants';
import { Holding, Quote, PortfolioInsight } from '../types';
import {
  MOVING_AVERAGE_THRESHOLD,
  FIFTY_TWO_WEEK_HIGH_MIN_THRESHOLD,
  FIFTY_TWO_WEEK_HIGH_MAX_THRESHOLD,
  FIFTY_TWO_WEEK_LOW_THRESHOLD,
} from './constants';
import {
  CalculateTagsOptions,
  InsightTag,
  InsightCalculator,
  InsightKey,
} from './types';

const baseTags = (options: CalculateTagsOptions, tags: InsightTag[]) => [
  { name: 'marketPrice', value: options.quote.regularMarketPrice },
  ...tags,
];

// Common tags for moving averages to avoid duplication
const getMovingAverageTags = ({
  quote,
}: CalculateTagsOptions): InsightTag[] => {
  const { twoHundredDayAverage, fiftyDayAverage } = quote;

  return baseTags({ quote }, [
    { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
    { name: 'fiftyDayAverage', value: fiftyDayAverage },
  ]);
};

const fiftyTwoWeekHighInsightCalculator: InsightCalculator = {
  type: INSIGHT_TYPE.BELOW_52_WEEK_HIGH,

  getInsight: (options) => {
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

    const inputs = fiftyTwoWeekHighInsightCalculator.getInputs(options);
    const { deltaPercent = 0 } = inputs;

    if (
      deltaPercent < FIFTY_TWO_WEEK_HIGH_MIN_THRESHOLD ||
      deltaPercent >= FIFTY_TWO_WEEK_HIGH_MAX_THRESHOLD
    ) {
      return undefined;
    }

    return {
      inputs,
    };
  },

  getInputs({ quote }) {
    const { fiftyTwoWeekHigh, regularMarketPrice, twoHundredDayAverage } =
      quote;

    // Renamed to make it clear that positive value means price is below the high
    const priceBelowHighDelta = fiftyTwoWeekHigh - regularMarketPrice;
    const deltaPercent =
      fiftyTwoWeekHigh > 0 ? priceBelowHighDelta / fiftyTwoWeekHigh : 0;

    return {
      fiftyTwoWeekHigh,
      fiftyTwoWeekHighDelta: priceBelowHighDelta, // Renamed for clarity
      deltaPercent,
      regularMarketPrice,
      twoHundredDayAverage,
    };
  },

  getTags: ({ quote }) => {
    const { fiftyTwoWeekHigh, twoHundredDayAverage } = quote;
    return baseTags({ quote }, [
      { name: 'fiftyTwoWeekHigh', value: fiftyTwoWeekHigh },
      { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
    ]);
  },
};

const fiftyTwoWeekLowInsightCalculator: InsightCalculator = {
  type: INSIGHT_TYPE.NEAR_52_WEEK_LOW,

  getInsight: (options) => {
    const inputs = fiftyTwoWeekLowInsightCalculator.getInputs(options);
    const { deltaPercent = 0 } = inputs;

    if (deltaPercent > FIFTY_TWO_WEEK_LOW_THRESHOLD) {
      // Price is more than 5% above 52 week low
      return undefined;
    }

    return {
      inputs,
    };
  },

  getInputs({ quote }) {
    const { fiftyTwoWeekLow, regularMarketPrice } = quote;

    // Renamed for clarity - positive means price is above the low
    const priceAboveLowDelta = regularMarketPrice - fiftyTwoWeekLow;
    const deltaPercent =
      fiftyTwoWeekLow > 0 ? priceAboveLowDelta / fiftyTwoWeekLow : 0;

    return {
      fiftyTwoWeekLow,
      delta: priceAboveLowDelta,
      deltaPercent,
      regularMarketPrice,
    };
  },

  getTags: ({ quote }) => {
    const { fiftyTwoWeekLow } = quote;
    return baseTags({ quote }, [
      { name: 'fiftyTwoWeekLow', value: fiftyTwoWeekLow },
    ]);
  },
};

const moving200AveragesInsightCalculator: InsightCalculator = {
  type: INSIGHT_TYPE.NEAR_MOVING_200_AVERAGES,

  getInsight: (options) => {
    const inputs = moving200AveragesInsightCalculator.getInputs(options);

    const { deltaPercent = 0 } = inputs;

    if (
      deltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      deltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return { inputs };
    }

    return undefined;
  },

  getInputs: ({ quote }) => {
    const { regularMarketPrice, twoHundredDayAverage, fiftyDayAverage } = quote;

    // Renamed for clarity - shows difference from 200-day average
    const priceVs200DayDelta = regularMarketPrice - twoHundredDayAverage;
    const twoHundredDayDeltaPercent =
      twoHundredDayAverage > 0 ? priceVs200DayDelta / twoHundredDayAverage : 0;

    return {
      regularMarketPrice,
      twoHundredDayAverage,
      fiftyDayAverage,
      deltaPercent: twoHundredDayDeltaPercent,
      isAbove: priceVs200DayDelta > 0,
      movingAverageDays: 200,
    };
  },

  getTags: getMovingAverageTags,
};

const moving50AveragesInsightCalculator: InsightCalculator = {
  type: INSIGHT_TYPE.NEAR_MOVING_50_AVERAGES,

  getInsight: (options) => {
    const inputs = moving50AveragesInsightCalculator.getInputs(options);

    const { deltaPercent = 0 } = inputs;

    if (
      deltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      deltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return { inputs };
    }

    return undefined;
  },

  getInputs: ({ quote }) => {
    const { regularMarketPrice, twoHundredDayAverage, fiftyDayAverage } = quote;

    // Renamed for clarity - shows difference from 50-day average
    const priceVs50DayDelta = regularMarketPrice - fiftyDayAverage;
    const fiftyDayDeltaPercent =
      fiftyDayAverage > 0 ? priceVs50DayDelta / fiftyDayAverage : 0;

    return {
      regularMarketPrice,
      fiftyDayAverage,
      twoHundredDayAverage,
      deltaPercent: fiftyDayDeltaPercent,
      isAbove: priceVs50DayDelta > 0,
      movingAverageDays: 50,
    };
  },

  getTags: getMovingAverageTags,
};

const insightsCalculators: InsightCalculator[] = [
  fiftyTwoWeekHighInsightCalculator,
  fiftyTwoWeekLowInsightCalculator,
  moving200AveragesInsightCalculator,
  moving50AveragesInsightCalculator,
];

export const getInsightKey = (options: InsightKey) =>
  [options.portfolioId, options.holdingId, options.type].join('_');

export const calculateInsights = (
  holding: Holding,
  quote: Quote
): PortfolioInsight[] =>
  insightsCalculators
    .map((calculator) => {
      try {
        const insight = calculator.getInsight({ holding, quote });

        if (!insight) {
          return undefined;
        }

        return {
          ...insight,
          type: calculator.type,
          holdingId: holding.id,
          portfolioId: holding.portfolioId,
          identifier: getInsightKey({
            holdingId: holding.id,
            portfolioId: holding.portfolioId,
            type: calculator.type,
          }),
          createdAt: Date.now(),
          tags: calculator.getTags({ quote }) ?? [],
        };
      } catch (error) {
        console.error(`Error calculating insight ${calculator.type}:`, error);
        return undefined;
      }
    })
    .filter(Boolean) as PortfolioInsight[];

export const calculateInsightTags = (insight: PortfolioInsight, quote: Quote) =>
  insightsCalculators
    .find((calculator) => calculator.type === insight.type)
    ?.getTags({ quote }) ?? [];

export const calculateInsightInputs = (
  insight: PortfolioInsight,
  holding: Holding,
  quote: Quote
) =>
  insightsCalculators
    .find((calculator) => calculator.type === insight.type)
    ?.getInputs({ quote, holding });
