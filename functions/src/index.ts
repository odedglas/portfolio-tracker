/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { portfolioHistoryTracker } from './portfolioHistoryTracker';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const manualPortfolioTracker = onRequest(
  { secrets: ['RAPID_YAHOO_API_KEY'] },
  async (request, response) => {
    await portfolioHistoryTracker();
    response.send('Hello from Firebase!');
  }
);

export const portfolioScheduler = onSchedule(
  'every 2 minutes',
  async (event) => {
    console.log('Event called', { event });
    logger.info('Scheduled Function', { timestamp: Date.now(), event });
    portfolioHistoryTracker();
    return;
  }
);
