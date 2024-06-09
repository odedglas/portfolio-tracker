import { defineStore } from 'pinia';
import * as stocksAPI from 'src/service/stocks';
import type { Quote } from 'src/service/stocks';

interface QuotesState {
  tickerQuotes: Record<string, Quote>;
  tickers: string[];
}

export const useQuotesStore = defineStore('quotes', {
  state: (): QuotesState => ({
    tickerQuotes: {},
    tickers: [],
  }),
  actions: {
    async getTickersQuotes(tickers: string[]) {
      if (!tickers.length) {
        return [];
      }

      const quotes = await stocksAPI.getQuotes(tickers);

      quotes.quoteResponse.result.forEach((quote) => {
        this.tickerQuotes[quote.symbol] = quote;
      });

      this.tickers = Array.from(new Set(Object.keys(this.tickerQuotes)));

      return this.tickerQuotes;
    },
    async addTicker(ticker: string) {
      if (!this.tickers.includes(ticker)) {
        this.tickers.push(ticker);

        await this.getTickersQuotes(this.tickers);
      }
    },
  },
});
