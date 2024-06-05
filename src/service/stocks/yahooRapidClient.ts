import axios from 'axios';
import {
  GetQuotesResponse,
  GetSearchResponse,
  StockChartResponse,
} from './schema';
import { startOfDay, tomorrow, toEpocNumeric, fromEpocNumeric } from './dates';
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

export const getDailyPrice = async (ticker: string, date = new Date()) => {
  const start = startOfDay(date);
  const end = tomorrow(start);

  const chartResult = await getRequest<StockChartResponse>(
    'stock/v3/get-chart',
    {
      interval: '1d',
      symbol: ticker,
      region: 'US',
      includePrePost: false,
      useYfid: false,
      includeAdjustedClose: false,
      period1: toEpocNumeric(start),
      period2: toEpocNumeric(end),
    }
  );

  const [dailyResult] = chartResult.chart.result;

  return {
    ...dailyResult,
    timestamp: dailyResult.timestamp.map((t) => fromEpocNumeric(t)),
  };
};
