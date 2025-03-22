import * as logger from 'firebase-functions/logger';
import {
  Holding,
  HoldingWithProfits,
  Portfolio,
  Quote,
} from '../../../shared/types';
import { holdingsTransformer } from '../../../shared/transformers';
import { getTickersQuotes } from './quotes';
import { getCollection } from './getCollection';

export type PortfoliosContext = {
  portfolios: Portfolio[];
  holdings: Holding[];
  tickerQuotes: Quote[];
  tickerQuotesMap: Record<string, Quote>;
  portfolioHoldings: Record<string, HoldingWithProfits[]>;
  holdingsWithProfits: HoldingWithProfits[];
  dryRun: boolean;
};

export const getPortfoliosContext = async (
  dryRun = false
): Promise<PortfoliosContext> => {
  const now = Date.now();
  logger.info('Calculating portfolios context start', {
    timestamp: now,
  });

  const portfolios = await getCollection<Portfolio>('portfolios');
  const holdings = await getCollection<Holding>('holdings');

  const holdingTickers = holdings.map((holding) => holding.ticker);
  const tickerQuotes = await getTickersQuotes(holdingTickers);

  const tickerQuotesMap: Record<string, Quote> = tickerQuotes.reduce(
    (acc, quote) => ({
      ...acc,
      [quote.symbol]: quote,
    }),
    {}
  );

  // For each holding, calculate it's "withProfits" entity.
  const holdingsWithProfits = holdings.map((holding) =>
    holdingsTransformer.withProfits(holding, tickerQuotesMap)
  );

  // Group holdings by portfolio
  const portfolioHoldings = holdingsWithProfits.reduce((acc, holding) => {
    acc[holding.portfolioId] ||= [];

    acc[holding.portfolioId].push(holding);

    return acc;
  }, {} as Record<string, HoldingWithProfits[]>);

  logger.info('Calculating portfolios context done', {
    totalTime: Date.now() - now,
  });

  return {
    portfolios,
    holdings,
    tickerQuotes,
    tickerQuotesMap,
    portfolioHoldings,
    holdingsWithProfits,
    dryRun,
  };
};
