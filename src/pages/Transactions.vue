<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-11">
      <p class="text-h5 text-grey-7 q-my-md">{{ $t('transactions.header') }}</p>
      <transactions-table
        :transactions="transactions"
        @delete-transaction="deleteTransaction"
        @edit-transaction="showCreateOrEditTransaction"
        :show-or-edit-transaction="showCreateOrEditTransaction"
      />
    </div>

    <transaction-dialog
      :show="showTransactionsModal"
      :transaction="transactionToEdit"
      @close-transaction="hideTransactionsModal"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { usePortfolioStore } from 'src/stores/portfolios';
import { useLoadingStore } from 'stores/loading';
import transactionsAPI from 'src/service/transactions';
import { useAreYouSure } from 'src/components/composables/useAreYouSureDialog';
import TransactionsTable from 'src/components/transactions/TransactionsTable.vue';
import TransactionDialog from 'src/components/transactions/TransactionDialog.vue';
import { Transaction } from 'src/types';

export default defineComponent({
  name: 'TransactionsPage',
  components: {
    TransactionsTable,
    TransactionDialog,
  },

  setup() {
    const portfolioStore = usePortfolioStore();
    const { emitLoadingTask } = useLoadingStore();
    const { showAreYouSure } = useAreYouSure();

    const showTransactionsModal = ref(false);
    const transactions = ref<Transaction[]>([]);
    const transactionToEdit = ref<Partial<Transaction> | undefined>(undefined);

    onMounted(async () => {
      if (portfolioStore.selectedPortfolioId) {
        transactions.value = await transactionsAPI.list(
          portfolioStore.selectedPortfolioId
        );
      }
      // TODO - Loading state
    });

    const showCreateOrEditTransaction = async (transaction?: Transaction) => {
      debugger;
      const isEdit = !!transaction?.id;
      if (isEdit) {
        transactionToEdit.value = { ...transaction };
      }

      showTransactionsModal.value = true;
    };

    const hideTransactionsModal = () => {
      transactionToEdit.value = undefined;
      showTransactionsModal.value = false;
    };

    const deleteTransaction = (transaction: Transaction) => {
      showAreYouSure({
        title: 'Delete Transaction',
        message: `Are you sure you want to delete transaction of "${transaction.ticker}"?`,
        callback: async () => {
          await emitLoadingTask(() => transactionsAPI.delete(transaction.id));

          // TODO - Handle sync UI
        },
      });
    };

    return {
      transactions,
      hideTransactionsModal,
      showCreateOrEditTransaction,
      showTransactionsModal,
      transactionToEdit,
      deleteTransaction,
    };
  },
});
</script>
