import { defineStore } from 'pinia';
import type { FearAndGreedValues, Quote } from 'app/shared/types';
import * as stocksAPI from 'src/service/stocks';

interface QuotesState {
  tickerQuotes: Record<string, Quote>;
  tickers: string[];
  fearAndGreed: Partial<FearAndGreedValues>;
}

export const useQuotesStore = defineStore('quotes', {
  state: (): QuotesState => ({
    tickerQuotes: {},
    tickers: [],
    fearAndGreed: {},
  }),
  actions: {
    async getTickersQuotes(tickers: string[]) {
      if (!tickers.length) {
        return [];
      }

      const quotes = await stocksAPI.getQuotes(tickers);

      this.tickerQuotes = quotes.quoteResponse.result.reduce(
        (tickerQuotes, quote) => ({
          ...tickerQuotes,
          [quote.symbol]: quote,
        }),
        this.tickerQuotes
      );

      this.tickers = Array.from(new Set(Object.keys(this.tickerQuotes)));

      return this.tickerQuotes;
    },
    async addTicker(ticker: string) {
      if (!this.tickers.includes(ticker)) {
        await this.getTickersQuotes([...this.tickers, ticker]);
      }
    },
    async setFearAndGreed() {
      const { data } = await stocksAPI.getFearAndGreedIndex();

      this.fearAndGreed = data.fgi;
    },
  },
});
