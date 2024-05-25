<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-11">
      <p class="text-h5 text-grey-7 q-my-md">{{ $t('transactions.header') }}</p>
      <transactions-table
        v-if="!transactionsStore.loading"
        @delete-transaction="deleteTransaction"
        @edit-transaction="showCreateOrEditTransaction"
        :show-or-edit-transaction="showCreateOrEditTransaction"
      />

      <q-card v-else class="loading-holder q-pa-sm">
        <div class="flex justify-between q-px-md">
          <q-skeleton
            class="q-my-md"
            v-for="index in [1, 2]"
            :key="index"
            bordered
            square
            height="40px"
            width="120px"
          />
        </div>
        <q-skeleton
          class="q-my-md"
          v-for="index in [1, 2, 3]"
          :key="index"
          bordered
          square
          height="60px"
        />
      </q-card>
    </div>

    <transaction-dialog
      :show="showTransactionsModal"
      :transaction="transactionToEdit"
      @save-transaction="syncTransactionState"
      @close-transaction="hideTransactionsModal"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useTransactionsStore } from 'src/stores/transactions';
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
    const transactionsStore = useTransactionsStore();
    const { emitLoadingTask } = useLoadingStore();
    const { showAreYouSure } = useAreYouSure();

    const showTransactionsModal = ref(false);
    const transactionToEdit = ref<Transaction | undefined>(undefined);

    const showCreateOrEditTransaction = async (transaction?: Transaction) => {
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

    const syncTransactionState = (transaction: Transaction) => {
      const existing =
        transactionsStore.transactions.find((t) => t.id === transaction.id) !==
        undefined;

      if (!existing) {
        transactionsStore.add(transaction);
      } else {
        transactionsStore.update(transaction);
      }
    };

    const deleteTransaction = (transaction: Transaction) => {
      showAreYouSure({
        title: 'Delete Transaction',
        message: `Are you sure you want to delete transaction of "${transaction.ticker}"?`,
        callback: async () => {
          await emitLoadingTask(() => transactionsAPI.delete(transaction.id));

          transactionsStore.remove(transaction.id);
        },
      });
    };

    return {
      transactionsStore,
      hideTransactionsModal,
      showCreateOrEditTransaction,
      showTransactionsModal,
      transactionToEdit,
      syncTransactionState,
      deleteTransaction,
    };
  },
});
</script>

<style lang="scss">
.loading-holder {
  height: 320px;
  border: 1px solid $grey-5;
}
</style>
