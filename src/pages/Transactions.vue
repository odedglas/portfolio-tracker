<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-11">
      <p class="text-h5 text-grey-7 q-my-md">{{ $t('transactions.header') }}</p>
      <transactions-table
        v-if="!transactionsStore.loading"
        @delete-transaction="deleteEntity"
        @edit-transaction="openEntityModal"
        :show-or-edit-transaction="openEntityModal"
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
      :show="showModal"
      :transaction="editEntity"
      @close="hideEntityModal"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTransactionsStore } from 'src/stores/transactions';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';
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
    const {
      editEntity,
      showModal,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
    } = useEditableEntityPage<Transaction>({
      deleteModal: {
        title: 'Delete Transaction',
        message: (transaction) =>
          `Are you sure you want to delete transaction of "${transaction.ticker}"?`,
        callback: (transaction) => transactionsStore.remove(transaction),
      },
    });

    return {
      transactionsStore,
      showModal,
      editEntity,
      openEntityModal,
      hideEntityModal,
      deleteEntity,
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
