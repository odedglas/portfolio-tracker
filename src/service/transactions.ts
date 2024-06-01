import { Transaction } from 'src/types';
import {
  getCollections,
  firestoreAPI,
  queries,
} from 'src/service/firebase/collections';
import { TRANSACTIONS_TYPES } from 'src/constants';

const transactionsCollection = () => getCollections().transaction;

export const transformer = {
  isBuy: (transaction: Transaction) =>
    transaction.action === TRANSACTIONS_TYPES.BUY,
  summary: (transactions: Transaction[]) =>
    transactions.reduce(
      (summary, transaction) => {
        const transactionValue = transaction.shares * transaction.price;

        summary[transaction.action] += transactionValue;
        summary.fees += transaction.fees || 0;

        return summary;
      },
      { buy: 0, sell: 0, fees: 0 }
    ),
  totalValue: (transaction: Transaction) =>
    transaction.shares * transaction.price,
  actualValue: (transaction: Transaction) =>
    transaction.actualShares * transaction.price,
  profitPercent: (profit: number, transaction: Transaction) => {
    const actualValue = transformer.actualValue(transaction);

    return actualValue
      ? Math.abs(
          profit /
            (transaction?.paidPrice ?? transformer.actualValue(transaction))
        )
      : 0;
  },
};

const api = {
  list: queries.listPortfolioTransactions,
  get: async (transactionId: string) =>
    firestoreAPI.getDocument(transactionsCollection(), transactionId),
  update: async (
    data: Transaction,
    transactionId?: string
  ): Promise<Transaction> => {
    if (!data.portfolioId) {
      throw new Error(
        'Cannot update/create a transaction without a valid portfolio id'
      );
    }

    if (!transactionId) {
      data.createdAt = Date.now();

      const result = await firestoreAPI.addDocument(
        transactionsCollection(),
        data
      );

      transactionId = result.id;
    } else {
      // TODO - Support price update - Realized profits + Paid price. (calculated be allocate/deallocate sell logic)
      await firestoreAPI.updateDocument(
        transactionId,
        transactionsCollection(),
        data
      );
    }

    return api.get(transactionId);
  },
  delete: async (transaction: Transaction) => {
    await firestoreAPI.deleteDocument(transaction.id, transactionsCollection());
  },
  allocateSellTransaction: (
    transaction: Transaction,
    transactions: Transaction[],
    allocate = true
  ) => {
    const available = [...transactions]
      .reverse()
      .filter((t) => transformer.isBuy(t) && t.ticker === transaction.ticker);

    let remainingShares = transaction.actualShares;
    let realizedProfitOrLoss = 0;
    let paidPrice = 0;
    let iterator = 0;

    while (remainingShares > 0 && available.length > 0) {
      const buyTransaction = available[iterator];

      const buyTransactionPotentialShares = allocate
        ? buyTransaction.actualShares
        : buyTransaction.shares - buyTransaction.actualShares;

      const soldShares = Math.min(
        buyTransactionPotentialShares,
        remainingShares
      );

      buyTransaction.actualShares += soldShares * (allocate ? -1 : 1);
      realizedProfitOrLoss +=
        soldShares * (transaction.price - buyTransaction.price);
      paidPrice += soldShares * buyTransaction.price;

      remainingShares -= soldShares;
      iterator++;
    }

    // Bound realized profit if sold and allocated (not deleted)
    if (allocate) {
      transaction.realizedProfit = realizedProfitOrLoss;
      transaction.paidPrice = paidPrice;
    }

    return available;
  },
};

export default api;
