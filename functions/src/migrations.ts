import * as logger from 'firebase-functions/logger';
import * as pMap from 'p-map';
import { Holding, Transaction } from '../../shared/types';
import { getCollection, updateDocuments } from './utils/getCollection';
import { searchTicker } from './utils/quotes';
import * as sectorsStub from './static/sectors.json';

type MigrationRunner = (dryRun: boolean) => Promise<unknown>;

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

  const sectorsMap: Record<string, { sector: string }> = sectorsStub;

  if (!Object.keys(sectorsMap)) {
    // TODO - Remove if fresh data is needed.
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
          sector: tickerMatch.industry?.replace('-', ' '),
        };

        await new Promise((resolve) => setTimeout(resolve, 3000));
      },
      { concurrency: 3 }
    );
  }

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

const backfillTransactionHoldingIds = async (dryRun = true) => {
  const holdings = await getCollection<Holding>('holdings');
  const transactions = await getCollection<Transaction>('transactions');

  // Group holdings and transactions by portfolioId + ticker
  const holdingsByKey = holdings.reduce((acc, holding) => {
    const key = `${holding.portfolioId}__${holding.ticker}`;
    acc[key] = acc[key] || [];
    acc[key].push(holding);
    return acc;
  }, {} as Record<string, Holding[]>);

  const transactionsByKey = transactions.reduce((acc, transaction) => {
    const key = `${transaction.portfolioId}__${transaction.ticker}`;
    acc[key] = acc[key] || [];
    acc[key].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const updatedTransactions: Transaction[] = [];

  for (const key of Object.keys(transactionsByKey)) {
    const keyHoldings = (holdingsByKey[key] || []).sort(
      (a, b) => a.createdAt - b.createdAt
    );
    const keyTransactions = transactionsByKey[key].sort(
      (a, b) => a.date - b.date
    );

    if (!keyHoldings.length) {
      logger.warn('No holdings found for transactions', { key });
      continue;
    }

    let holdingIndex = 0;
    let runningShares = 0;

    for (const transaction of keyTransactions) {
      const holding = keyHoldings[holdingIndex];

      if (!holding) {
        logger.warn('Ran out of holdings for transactions', {
          key,
          transaction,
        });
        break;
      }

      const isBuy = transaction.action === 'buy';
      runningShares += isBuy ? transaction.shares : -transaction.shares;

      updatedTransactions.push({ ...transaction, holdingId: holding.id });

      // When shares hit 0, the holding was fully sold — advance to next holding
      if (runningShares <= 0) {
        runningShares = 0;
        holdingIndex++;
      }
    }
  }

  logger.info('Backfilling holdingId on transactions', {
    total: transactions.length,
    toUpdate: updatedTransactions.length,
  });

  if (!dryRun) {
    await updateDocuments('transactions', updatedTransactions);
    logger.info('Saved updated transactions');
    return { total: transactions.length, updated: updatedTransactions.length };
  } else {
    const result = {
      dryRun: true,
      total: transactions.length,
      toUpdate: updatedTransactions.length,
      transactions: updatedTransactions.map((t) => ({
        id: t.id,
        ticker: t.ticker,
        action: t.action,
        holdingId: t.holdingId,
      })),
    };
    logger.info('Dry run mode, skipping save', result);
    return result;
  }
};

const migrationsMap: Record<string, MigrationRunner> = {
  transactionImages: alignTransactionsWithHoldingImages,
  holdingsSectors: setHoldingsSectors,
  backfillTransactionHoldingIds,
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
    return migrationResult;
  } catch (error: unknown) {
    console.log(error);
    logger.error('Migration failed', { name, error });
    return;
  }
};
