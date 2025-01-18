import { mapValues } from 'lodash';
import {
  GetQuotesResponse,
  GetSearchResponse,
  StockChartResponse,
} from 'app/shared/types';
import { stocksClient } from 'app/shared/api';
import { fromEpocNumeric } from './dates';
import { cachedOperation } from 'src/service/stocks/localStorageCache';

export const search = cachedOperation(
  (query: string) =>
    stocksClient.getRequest<GetSearchResponse>('/auto-complete', {
      q: query,
      region: 'US',
    }),
  (query: string) => `ticker-search-${query}`
);

export const getQuotes = cachedOperation(
  (tickers: string[]) =>
    stocksClient.getRequest<GetQuotesResponse>('market/v2/get-quotes', {
      region: 'US',
      symbols: tickers.join(','),
    }),
  (tickers: string[]) => `ticker-quotes-${tickers.join('-')}`,
  process.env.STOCKS_QUOTE_CACHE_TTL
    ? Number(process.env.STOCKS_QUOTE_CACHE_TTL)
    : 1000 * 60 * 60 // 1 hour default
);

export const getQuotesChartData = cachedOperation(
  async (tickers: string[], interval?: string, range?: string) => {
    const chartResult = await stocksClient.getRequest<StockChartResponse>(
      'market/get-spark',
      {
        interval: interval ?? '1d',
        range: range ?? '1y',
        symbols: tickers.join(','),
      }
    );

    return mapValues(chartResult, (tickerChart) => ({
      ...tickerChart,
      timestamp: tickerChart.timestamp.map(fromEpocNumeric),
    }));
  },
  (tickers: string[], interval, range) =>
    ['ticker-chart-data', ...tickers, interval, range]
      .filter(Boolean)
      .join('-'),
  1000 * 60 * 60 // One hour chart data caching
);

export const getFearAndGreedIndex = cachedOperation(
  () => stocksClient.getFearAndGreedIndex(),
  'fear-and-greed',
  1000 * 60 * 60 // One hour chart data caching
);
