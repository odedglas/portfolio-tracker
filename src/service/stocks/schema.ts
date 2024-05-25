type EarningsChart = {
  quarterly: {
    date: string;
    actual: number;
    estimate: number;
  }[];
  currentQuarterEstimate: number;
  currentQuarterEstimateDate: string;
  currentQuarterEstimateYear: number;
  earningsDate: number[];
};

type FinancialsChart = {
  yearly: {
    date: number;
    revenue: number;
    earnings: number;
  }[];
  quarterly: {
    date: string;
    revenue: number;
    earnings: number;
  }[];
};

type QuoteSummary = {
  earnings: {
    maxAge: number;
    earningsChart: EarningsChart;
    financialsChart: FinancialsChart;
    financialCurrency: string;
  };
};

export type Quote = {
  language: string;
  region: string;
  quoteType: string;
  typeDisp: string;
  quoteSourceName: string;
  triggerable: boolean;
  customPriceAlertConfidence: string;
  quoteSummary: QuoteSummary;
  components: string[];
  currency: string;
  hasPrePostMarketData: boolean;
  firstTradeDateMilliseconds: number;
  priceHint: number;
  totalCash: number;
  floatShares: number;
  ebitda: number;
  shortRatio: number;
  preMarketChange: number;
  preMarketChangePercent: number;
  preMarketTime: number;
  targetPriceHigh: number;
  targetPriceLow: number;
  targetPriceMean: number;
  targetPriceMedian: number;
  preMarketPrice: number;
  heldPercentInsiders: number;
  heldPercentInstitutions: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  sharesShort: number;
  sharesShortPrevMonth: number;
  shortPercentFloat: number;
  regularMarketPreviousClose: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  exchange: string;
  market: string;
  messageBoardId: string;
  fullExchangeName: string;
  shortName: string;
  longName: string;
  regularMarketOpen: number;
  averageDailyVolume3Month: number;
  averageDailyVolume10Day: number;
  beta: number;
  fiftyTwoWeekLowChange: number;
  fiftyTwoWeekLowChangePercent: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekHighChange: number;
  fiftyTwoWeekHighChangePercent: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  exDividendDate: number;
  earningsTimestamp: number;
  earningsTimestampStart: number;
  earningsTimestampEnd: number;
  trailingAnnualDividendRate: number;
  trailingPE: number;
  pegRatio: number;
  trailingAnnualDividendYield: number;
  revenue: number;
  priceToSales: number;
  marketState: string;
  epsTrailingTwelveMonths: number;
  epsForward: number;
  epsCurrentYear: number;
  epsNextQuarter: number;
  priceEpsCurrentYear: number;
  priceEpsNextQuarter: number;
  sharesOutstanding: number;
  bookValue: number;
  fiftyDayAverage: number;
  fiftyDayAverageChange: number;
  fiftyDayAverageChangePercent: number;
  twoHundredDayAverage: number;
  twoHundredDayAverageChange: number;
  twoHundredDayAverageChangePercent: number;
  marketCap: number;
  forwardPE: number;
  priceToBook: number;
  sourceInterval: number;
  exchangeDataDelayedBy: number;
  exchangeTimezoneName: string;
  exchangeTimezoneShortName: string;
  pageViews: {
    midTermTrend: string;
    longTermTrend: string;
    shortTermTrend: string;
  };
  gmtOffSetMilliseconds: number;
  esgPopulated: boolean;
  tradeable: boolean;
  cryptoTradeable: boolean;
  symbol: string;
};

export type GetQuotesResponse = {
  quoteResponse: {
    result: Quote[];
  };
};

export type GetSearchResponse = {
  count: number;
  quotes: SearchQuote[];
  news: News[];
  totalTime: number;
  timeTakenForQuotes: number;
  timeTakenForNews: number;
  timeTakenForAlgowatchlist: number;
  timeTakenForPredefinedScreener: number;
  timeTakenForCrunchbase: number;
  timeTakenForNav: number;
  timeTakenForResearchReports: number;
  timeTakenForScreenerField: number;
  timeTakenForCulturalAssets: number;
};

interface SearchQuote {
  exchange: string;
  shortname: string;
  quoteType: string;
  symbol: string;
  index: string;
  score: number;
  typeDisp: string;
  longname: string;
  exchDisp: string;
  sector: string;
  sectorDisp: string;
  industry: string;
  industryDisp: string;
  dispSecIndFlag?: boolean;
  isYahooFinance: boolean;
}

interface News {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
  thumbnail?: Thumbnail;
  relatedTickers?: string[];
}

interface Thumbnail {
  resolutions: Resolution[];
}

interface Resolution {
  url: string;
  width: number;
  height: number;
  tag: string;
}

export interface StockChartResponse {
  chart: {
    result: ChartResult[];
    error: unknown;
  };
}

interface ChartResult {
  meta: Meta;
  timestamp: number[];
  indicators: Indicators;
}

interface Meta {
  currency: string;
  symbol: string;
  exchangeName: string;
  fullExchangeName: string;
  instrumentType: string;
  firstTradeDate: number;
  regularMarketTime: number;
  hasPrePostMarketData: boolean;
  gmtoffset: number;
  timezone: string;
  exchangeTimezoneName: string;
  regularMarketPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  chartPreviousClose: number;
  priceHint: number;
  currentTradingPeriod: TradingPeriod;
  dataGranularity: string;
  range: string;
  validRanges: string[];
}

interface TradingPeriod {
  pre: Period;
  regular: Period;
  post: Period;
}

interface Period {
  timezone: string;
  start: number;
  end: number;
  gmtoffset: number;
}

interface Indicators {
  quote: QuoteIndicator[];
  adjclose: AdjCloseIndicator[];
}

interface QuoteIndicator {
  close: number[];
  volume: number[];
  open: number[];
  low: number[];
  high: number[];
}

interface AdjCloseIndicator {
  adjclose: number[];
}
