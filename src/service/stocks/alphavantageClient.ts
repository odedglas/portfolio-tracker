import AlphaVantage, { DataType } from 'alphavantage-wrapper-ts';
import { localStorageCache } from 'src/service/stocks/localStorageCache';

const apikey = process.env.ALPHAVANTAGE_API_KEY as string;

const client = new AlphaVantage({ apikey });

type SearchResult = ReturnType<typeof client.stockTimeSeries.search>;

export const alphavantage = {
  search: async (ticker: string) => {
    const cacheKey = `ticker-search-${ticker}`;

    if (localStorageCache.exists(cacheKey)) {
      return localStorageCache.get(cacheKey) as SearchResult;
    }

    const searchResult = await client.stockTimeSeries.search({
      keywords: ticker,
      datatype: DataType.JSON,
    });

    localStorageCache.set(cacheKey, searchResult);

    return searchResult;
  },
};
