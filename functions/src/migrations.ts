import * as logger from 'firebase-functions/logger';
import * as pMap from 'p-map';
import { Holding, Transaction } from '../../shared/types';
import { getCollection, updateDocuments } from './utils/getCollection';
import { searchTicker } from './utils/quotes';

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

const setHoldingsSectors = async (dryRun = true) => {
  const holdings = await getCollection<Holding>('holdings');

  const holdingsTickers = [
    ...new Set(holdings.map((holding) => holding.ticker)),
  ];

  let sectorsMap: Record<string, { sector: string; industry: string }> = {};

  await pMap(
    holdingsTickers,
    async (ticker) => {
      const search = await searchTicker(ticker);

      const tickerMatch = search.find((t) => t.symbol === ticker);

      if (!tickerMatch) {
        logger.warn('No ticker found', { ticker });
        return;
      }

      sectorsMap[ticker] = {
        sector: tickerMatch.sector?.replace('-', ' '),
        industry: tickerMatch.industry?.replace('-', ' '),
      };

      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
    { concurrency: 3 }
  );

  const updatedHoldings = holdings.map((holding) => {
    return {
      ...holding,
      ...sectorsMap[holding.ticker],
    };
  });

  if (!dryRun) {
    logger.info('Saving updated holdings', {
      count: updatedHoldings.length,
      ids: updatedHoldings.map((t) => t.id),
    });
    await updateDocuments('holdings', updatedHoldings);
  } else {
    logger.info('Dry run mode, skipping save', { sectorsMap });
  }
};

const migrationsMap: Record<string, MigrationRunner> = {
  transactionImages: alignTransactionsWithHoldingImages,
  holdingsSectors: setHoldingsSectors,
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
    console.log(error);
    logger.error('Migration failed', { name, error });
    return;
  }
};
