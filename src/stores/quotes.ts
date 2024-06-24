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

      this.tickerQuotes = quotes.quoteResponse.result.reduce(
        (tickerQuotes, quote) => ({
          ...tickerQuotes,
          [quote.symbol]: quote,
        }),
        this.tickerQuotes
      );

      this.tickers = Array.from(new Set(Object.keys(this.tickerQuotes)));
      const chartData = await stocksAPI.getQuotesChartData(this.tickers);
      console.log(chartData);

      return this.tickerQuotes;
    },
    async addTicker(ticker: string) {
      if (!this.tickers.includes(ticker)) {
        await this.getTickersQuotes([...this.tickers, ticker]);
      }
    },
  },
});
