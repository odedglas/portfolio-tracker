import { Transaction } from '../types';
import { TRANSACTIONS_TYPES } from '../constants';

export const transactionsTransformer = {
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
    transaction.shares * transaction.price + (transaction.fees ?? 0),
  actualValue: (transaction: Transaction) =>
    transaction.actualShares * transaction.price + (transaction.fees ?? 0),
  fundsValue: (transaction: Transaction) =>
    transaction.paidPrice ?? transactionsTransformer.totalValue(transaction),
  profitPercent: (profit: number, transaction: Transaction) => {
    const actualValue = transactionsTransformer.actualValue(transaction);

    return actualValue
      ? Math.abs(profit / (transaction?.paidPrice ?? actualValue))
      : 0;
  },
};
