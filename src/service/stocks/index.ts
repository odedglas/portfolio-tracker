import {
  search,
  getQuotes,
  getQuotesChartData,
  getFearAndGreedIndex,
} from './yahooRapidClient';
import { findTickerImage } from './logos';

export const getTickerData = async (ticker: string) => {
  const searchResults = (await search(ticker)).quotes.filter(
    (quote) => quote.quoteType !== 'OPTION'
  );

  const logos = await Promise.all(
    searchResults.map((result) =>
      result.quoteType === 'EQUITY'
        ? findTickerImage(result.symbol)
        : Promise.resolve('')
    )
  );

  const tickerPrices = await getQuotes(
    searchResults.map((quote) => quote.symbol)
  );

  return searchResults.map((result, index) => {
    const tickerQuotes = tickerPrices.quoteResponse.result.find(
      (quote) => quote.symbol === result.symbol
    );

    return {
      ...result,
      logoImage: logos[index],
      lastPrice: tickerQuotes?.regularMarketPrice,
    };
  });
};

export { getQuotes, getQuotesChartData, getFearAndGreedIndex };
