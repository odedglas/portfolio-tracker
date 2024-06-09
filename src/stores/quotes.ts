import { defineStore } from 'pinia';
import * as stocksAPI from 'src/service/stocks';
import type { Quote } from 'src/service/stocks';

interface QuotesState {
  tickerQuotes: Record<string, Quote>;
}

export const useQuotesStore = defineStore('quotes', {
  state: (): QuotesState => ({
    tickerQuotes: {},
  }),
  actions: {
    async getTickersQuotes(tickers: string[]) {
      const quotes = await stocksAPI.getQuotes(tickers);

      quotes.quoteResponse.result.forEach((quote) => {
        this.tickerQuotes[quote.symbol] = quote;
      });

      return this.tickerQuotes;
    },
  },
});
