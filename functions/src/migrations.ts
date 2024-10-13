import * as logger from 'firebase-functions/logger';
import { Holding, Transaction } from '../../shared/types';
import { getCollection, updateDocuments } from './utils/getCollection';

type MigrationRunner = (dryRun: boolean) => Promise<void>;

const alignTransactionsWithHoldingImages = async (dryRun = true) => {
  const holdings = await getCollection<Holding>('holdings');
  const transactions = await getCollection<Transaction>('transactions');

  const holdingsImageMap = holdings.reduce((acc, holding) => {
    acc[holding.ticker] = acc[holding.ticker] || holding.logoImage;
    return acc;
  }, {} as Record<string, string | undefined>);

  // Fills transactions into their respective holding image
  const updatedTransactions: Transaction[] = transactions.map((transaction) => {
    const holdingImage =
      holdingsImageMap[transaction.ticker] ?? transaction.logoImage;

    if (holdingImage) {
      logger.info('Updating transaction with holding image', {
        ticker: transaction.ticker,
        holdingImage,
      });
    } else {
      logger.warn('No image found for holding', {
        ticker: transaction.ticker,
        holdingImage,
      });
    }

    return {
      ...transaction,
      logoImage: holdingImage,
    };
  });

  if (!dryRun) {
    logger.info('Saving updated transactions', {
      count: updatedTransactions.length,
      ids: updatedTransactions.map((t) => t.id),
    });
    await updateDocuments('transactions', updatedTransactions);
  } else {
    logger.info('Dry run mode, skipping save');
  }
};

const migrationsMap: Record<string, MigrationRunner> = {
  transactionImages: alignTransactionsWithHoldingImages,
};

/**
 * Runs a given migration name
 * @param {string} name - The name of a given migration to run
 * @param {boolean} dryRUn - Rather to use "dryRun" mode or not.
 */
export const migrations = async (name: string, dryRUn = true) => {
  logger.info(`Running migration - ${name}`, { dryRUn });

  const migrationRunner = migrationsMap[name];
  if (!migrationRunner) {
    logger.error('Migration not found', { name });
    return;
  }

  try {
    const migrationResult = await migrationRunner(dryRUn);
    logger.info(`Migration ${name} completed`, { migrationResult });
  } catch (error: unknown) {
    logger.error('Migration failed', { name, error });
    return;
  }
};
