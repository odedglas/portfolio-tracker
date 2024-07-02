import * as https from 'node:https';
import { stocksClient } from '../../../shared/api';
import { GetQuotesResponse } from '../../../shared/types';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const getTickersQuotes = async(tickers: string[]) => {
  const uniqTickers = [...new Set(tickers)];

  const tickerQuotesResponse =
    await stocksClient.getRequest<GetQuotesResponse>(
      'market/v2/get-quotes',
      {
        region: 'US',
        symbols: uniqTickers.join(','),
      },
      httpsAgent
    );

  return tickerQuotesResponse.quoteResponse.result;
};
