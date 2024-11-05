import { computed } from 'vue';
import { transactionsTransformer } from 'app/shared/transformers';
import { date } from 'quasar';
import { useTransactionsStore } from 'stores/transactions';

export const useViewTransactions = () => {
  const transactionsStore = useTransactionsStore();

  const viewTransactions = computed(() =>
    transactionsStore.transactions.map((transaction) => {
      const isBuyAction = transactionsTransformer.isBuy(transaction);
      const profitValue = transactionsStore.balanceMap[transaction.id] ?? 0;
      const transactionValue = transactionsTransformer.totalValue(transaction);

      return {
        ...transaction,
        actionTextClass: isBuyAction ? 'text-green-4' : 'text-red-4',
        totalValue: {
          value: transactionValue,
          textClass: isBuyAction ? 'text-red-6' : 'text-green-6',
          sign: isBuyAction ? '-' : '+',
        },
        formattedDate: date.formatDate(transaction.date, 'MM/DD/YY'),
        profit: {
          value: profitValue,
          percent: transactionsTransformer.profitPercent(
            profitValue,
            transaction
          ),
        },
      };
    })
  );

  return { viewTransactions };
};
