import { INSIGHT_TYPE } from '../constants';
import {
  Holding,
  Quote,
  PortfolioInsight,
  ViewPortfolioInsight,
} from '../types';

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

  getTags: (options: CalculateTagsOptions) => InsightTag[];
};

const baseTags = (options: CalculateTagsOptions, tags: InsightTag[]) => [
  { name: 'marketPrice', value: options.quote.regularMarketPrice },
  ...tags,
];

const fiftyTwoWeekHighInsightCalculator = {
  type: INSIGHT_TYPE.BELOW_52_WEEK_HIGH,

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
      inputs: {
        fiftyTwoWeekHigh,
        fiftyTwoWeekHighDelta,
        deltaPercent,
        regularMarketPrice,
        twoHundredDayAverage,
      },
    };
  },

  getTags: ({ quote }: CalculateTagsOptions) => {
    const { fiftyTwoWeekHigh, twoHundredDayAverage } = quote;
    return baseTags({ quote }, [
      { name: 'fiftyTwoWeekHigh', value: fiftyTwoWeekHigh },
      { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
    ]);
  },
};

const fiftyTwoWeekLowInsightCalculator = {
  type: INSIGHT_TYPE.NEAR_52_WEEK_LOW,

  getInsight: (options: CalculateInsightOptions) => {
    const { quote } = options;
    const { fiftyTwoWeekLow, regularMarketPrice } = quote;

    const delta = regularMarketPrice - fiftyTwoWeekLow;
    const deltaPercent = delta / fiftyTwoWeekLow;

    if (deltaPercent > 0.05) {
      // Price is more than 5% above 52 week low
      return undefined;
    }

    return {
      inputs: {
        fiftyTwoWeekLow,
        delta,
        deltaPercent,
        regularMarketPrice,
      },
    };
  },

  getTags: ({ quote }: CalculateTagsOptions) => {
    const { fiftyTwoWeekLow } = quote;
    return baseTags({ quote }, [
      { name: 'fiftyTwoWeekLow', value: fiftyTwoWeekLow },
    ]);
  },
};

const MOVING_AVERAGE_THRESHOLD = 0.025;

const movingAveragesInsightCalculator = {
  type: INSIGHT_TYPE.NEAR_MOVING_AVERAGES,

  getInsight: (
    options: CalculateInsightOptions
  ):
    | Omit<PortfolioInsight, 'portfolioId' | 'id' | 'holdingId' | 'type'>
    | undefined => {
    const { quote } = options;

    const { regularMarketPrice, fiftyDayAverage, twoHundredDayAverage } = quote;

    const twoHundredDayDelta = regularMarketPrice - twoHundredDayAverage;
    const twoHundredDayDeltaPercent = twoHundredDayDelta / twoHundredDayAverage;

    if (
      twoHundredDayDeltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      twoHundredDayDeltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return {
        inputs: {
          regularMarketPrice,
          twoHundredDayAverage,
          deltaPercent: twoHundredDayDeltaPercent,
          isAbove: twoHundredDayDelta > 0,
          movingAverageDays: 200,
        },
      };
    }

    const fiftyDayDelta = regularMarketPrice - fiftyDayAverage;
    const fiftyDayDeltaPercent = fiftyDayDelta / fiftyDayAverage;

    if (
      fiftyDayDeltaPercent <= MOVING_AVERAGE_THRESHOLD &&
      fiftyDayDeltaPercent >= -MOVING_AVERAGE_THRESHOLD
    ) {
      return {
        inputs: {
          regularMarketPrice,
          isAbove: fiftyDayDelta > 0,
          fiftyDayAverage,
          deltaPercent: fiftyDayDeltaPercent,
          movingAverageDays: 50,
        },
      };
    }

    return undefined;
  },

  getTags: ({ quote }: CalculateTagsOptions) => {
    const { twoHundredDayAverage, fiftyDayAverage } = quote;
    return baseTags({ quote }, [
      { name: 'twoHundredDayAverage', value: twoHundredDayAverage },
      { name: 'fiftyDayAverage', value: fiftyDayAverage },
    ]);
  },
};

const insightsCalculators: InsightCalculator[] = [
  fiftyTwoWeekHighInsightCalculator,
  fiftyTwoWeekLowInsightCalculator,
  movingAveragesInsightCalculator,
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

export const calculateInsight = (insight: ViewPortfolioInsight, quote: Quote) =>
  insightsCalculators
    .find((calculator) => calculator.type === insight.type)
    ?.getInsight({ quote, holding: insight.holding });

export const calculateInsightTags = (insight: PortfolioInsight, quote: Quote) =>
  insightsCalculators
    .find((calculator) => calculator.type === insight.type)
    ?.getTags({ quote }) ?? [];
