import axios from 'axios';
import { mapValues } from 'lodash';
import {
  GetQuotesResponse,
  GetSearchResponse,
  StockChartResponse,
} from './schema';
import { fromEpocNumeric } from './dates';
import { cachedOperation } from 'src/service/stocks/localStorageCache';
const axiosInstance = axios.create({
  baseURL: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_YAHOO_API_KEY,
    'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
  },
});

const getRequest = async <Resolved>(url: string, params: object) => {
  const options = {
    method: 'GET',
    url,
    params,
  };

  try {
    const { data } = await axiosInstance.request<Resolved>(options);

    return data;
  } catch (error) {
    throw new Error('Failed to fetch search results');
  }
};

export const search = cachedOperation(
  (query: string) =>
    getRequest<GetSearchResponse>('/auto-complete', {
      q: query,
      region: 'US',
    }),
  (query: string) => `ticker-search-${query}`
);

export const getQuotes = cachedOperation(
  (tickers: string[]) =>
    getRequest<GetQuotesResponse>('market/v2/get-quotes', {
      region: 'US',
      symbols: tickers.join(','),
    }),
  (tickers: string[]) => `ticker-quotes-${tickers.join('-')}`,
  1000 * 60 * 60 // One hour quotes caching
);

export const getQuotesChartData = cachedOperation(
  async (tickers: string[]) => {
    const chartResult = await getRequest<StockChartResponse>(
      'market/get-spark',
      {
        interval: '1d',
        range: '1mo',
        symbols: tickers.join(','),
      }
    );

    return mapValues(chartResult, (tickerChart) => ({
      ...tickerChart,
      timestamp: tickerChart.timestamp.map(fromEpocNumeric),
    }));
  },
  (tickers: string[]) => `ticker-chart-data-${tickers.join('-')}`,
  1000 * 60 * 60 // One hour chart data caching
);
