import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { AppCollectionsNames } from '../../shared/types';
import { deleteDocumentsByPortfolioId } from './utils/getCollection';

const PORTFOLIO_DEPENDENT_COLLECTIONS: AppCollectionsNames[] = [
  'holdings',
  'transactions',
  'portfolioHistory',
  'insights',
  'alerts',
  'notifications',
];

export const onPortfolioDeleted = onDocumentDeleted(
  'portfolios/{portfolioId}',
  async (event) => {
    const portfolioId = event.params.portfolioId;
    const db = getFirestore();

    logger.info('Portfolio deleted, starting cascade cleanup', { portfolioId });

    const results = await Promise.all(
      PORTFOLIO_DEPENDENT_COLLECTIONS.map(async (collection) => {
        const deleted = await deleteDocumentsByPortfolioId(
          db,
          collection,
          portfolioId
        );
        logger.info(`Cleaned up ${deleted} docs from ${collection}`, {
          portfolioId,
          collection,
          deleted,
        });
        return { collection, deleted };
      })
    );

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0);
    logger.info('Portfolio cascade cleanup complete', {
      portfolioId,
      totalDeleted,
      breakdown: results,
    });
  }
);
