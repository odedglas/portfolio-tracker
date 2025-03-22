import { INSIGHT_TYPE } from '../constants';
import { Holding, Quote, PortfolioInsight } from '../types';

/**
 * Options for calculating insights
 */
export type CalculateInsightOptions = {
  holding: Holding;
  quote: Quote;
};

/**
 * Options for calculating tags
 */
export type CalculateTagsOptions = {
  quote: Quote;
};

/**
 * Represents a tag for an insight with a name and value
 */
export type InsightTag = {
  name: string;
  value: number;
  format?: string;
};

/**
 * Definition of an insight calculator
 */
export type InsightCalculator = {
  type: (typeof INSIGHT_TYPE)[keyof typeof INSIGHT_TYPE];

  getInsight: (
    options: CalculateInsightOptions
  ) =>
    | Omit<PortfolioInsight, 'portfolioId' | 'id' | 'holdingId' | 'type'>
    | undefined;

  getInputs: (options: CalculateInsightOptions) => PortfolioInsight['inputs'];

  getTags: (options: CalculateTagsOptions) => InsightTag[];
};

/**
 * Unique key for an insight
 */
export type InsightKey = {
  holdingId: string;
  portfolioId: string;
  type: string;
};
