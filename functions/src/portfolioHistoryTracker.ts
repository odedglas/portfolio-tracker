import * as logger from 'firebase-functions/logger';
import * as https from 'node:https';
import { stocksClient } from '../../shared/api';
import { GetQuotesResponse } from '../../shared/types';

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

export const portfolioHistoryTracker = async() => {
  const now = Date.now();

  const tickers = ['SPY', 'FVRR', 'QQQ'];

  try {
    const tickerQuotesResponse = await stocksClient.getRequest<GetQuotesResponse>('market/v2/get-quotes', {
      region: 'US',
      symbols: tickers.join(','),
    }, httpsAgent);

    console.log('Responded', tickerQuotesResponse.quoteResponse.result);
  } catch (e) {
    console.log('Failed with error', e)
  }


  logger.info('Portfolio History Tracker', { timestamp: now });
};

