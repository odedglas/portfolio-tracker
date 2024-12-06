import { INSIGHT_TYPE } from '../constants';
import { Holding, Quote, PortfolioInsight } from '../types';

const MOVING_AVERAGE_THRESHOLD = 0.025;

type CalculateInsightOptions = {
  holding: Holding;
  quote: Quote;
};

type CalculateTagsOptions = {
  quote: Quote;
};

type InsightTag = { name: string; value: number; format?: string };
type InsightCalculator = {
  type: (typeof INSIGHT_TYPE)[keyof typeof INSIGHT_TYPE];

  getInsight: (
    options: CalculateInsightOptions
  ) =>
    | Omit<PortfolioInsight, 'portfolioId' | 'id' | 'holdingId' | 'type'>
    | undefined;

  getInputs: (options: CalculateInsightOptions) => PortfolioInsight['inputs'];

  getTags: (options: CalculateTagsOptions) => InsightTag[];
};

const baseTags = (options: CalculateTagsOptions, tags: InsightTag[]) => [
  { name: 'marketPrice', value: options.quote.regularMarketPrice },
  ...tags,
];

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

    if (deltaPercent < 0.15 || deltaPercent >= 0.35) {
      return undefined;
    }

    return {
      inputs,
    };
  },

  getInputs({ quote }) {
    const { fiftyTwoWeekHigh, regularMarketPrice, twoHundredDayAverage } =
      quote;

    const fiftyTwoWeekHighDelta = fiftyTwoWeekHigh - regularMarketPrice;
    const deltaPercent = fiftyTwoWeekHighDelta / fiftyTwoWeekHigh;

    return {
      fiftyTwoWeekHigh,
      fiftyTwoWeekHighDelta,
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

    if (deltaPercent > 0.05) {
      // Price is more than 5% above 52 week low
      return undefined;
    }

    return {
      inputs,
    };
  },

  getInputs({ quote }) {
    const { fiftyTwoWeekLow, regularMarketPrice } = quote;

    const delta = regularMarketPrice - fiftyTwoWeekLow;
    const deltaPercent = delta / fiftyTwoWeekLow;

    return {
      fiftyTwoWeekLow,
      delta,
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

    const twoHundredDayDelta = regularMarketPrice - twoHundredDayAverage;
    const twoHundredDayDeltaPercent = twoHundredDayDelta / twoHundredDayAverage;

    return {
      regularMarketPrice,
      twoHundredDayAverage,
      fiftyDayAverage,
      deltaPercent: twoHundredDayDeltaPercent,
      isAbove: twoHundredDayDelta > 0,
      movingAverageDays: 200,
    };
  },

  getTags: ({ quote }) => {
    const { twoHundredDayAverage, fiftyDayAverage } = quote;
    return baseTags({ quote }, [
      { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
      { name: 'fiftyDayAverage', value: fiftyDayAverage },
    ]);
  },
};

const moving50AveragesInsightCalculator: InsightCalculator = {
  type: INSIGHT_TYPE.NEAR_MOVING_50_AVERAGES,

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

    const fiftyDayDelta = regularMarketPrice - fiftyDayAverage;
    const fiftyDayDeltaPercent = fiftyDayDelta / fiftyDayAverage;

    return {
      regularMarketPrice,
      fiftyDayAverage,
      twoHundredDayAverage,
      deltaPercent: fiftyDayDeltaPercent,
      isAbove: fiftyDayDeltaPercent > 0,
      movingAverageDays: 50,
    };
  },

  getTags: moving200AveragesInsightCalculator.getTags,
};

const insightsCalculators: InsightCalculator[] = [
  fiftyTwoWeekHighInsightCalculator,
  fiftyTwoWeekLowInsightCalculator,
  moving200AveragesInsightCalculator,
  moving50AveragesInsightCalculator,
];

type InsightKey = { holdingId: string; portfolioId: string; type: string };

export const getInsightKey = (options: InsightKey) =>
  [options.portfolioId, options.holdingId, options.type].join('_');

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
    })
    .filter(Boolean) as PortfolioInsight[];

export const calculateInsightTags = (insight: PortfolioInsight, quote: Quote) =>
  insightsCalculators
    .find((calculator) => calculator.type === insight.type)
    ?.getTags({ quote }) ?? [];
