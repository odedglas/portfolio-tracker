<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10">
      <p class="text-h5 text-grey-7 q-my-md">
        {{ $t('portfolios.cash_flow') }}
      </p>
      <cash-flow-table
        @delete-deposit="deleteEntity"
        @edit-deposit="onDepositUpdate"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CashFlowTable from 'components/portfolio/CashFlowTable.vue';
import { useEditableEntityPage } from 'components/composables/useEditableEntityPage';
import { DepositEntity } from 'src/types';
import { usePortfolioStore } from 'stores/portfolios';
import { useLoadingStore } from 'stores/loading';

export default defineComponent({
  name: 'CashFlowPage',
  components: {
    CashFlowTable,
  },
  setup() {
    const { emitLoadingTask } = useLoadingStore();
    const portfolioStore = usePortfolioStore();

    const { deleteEntity } = useEditableEntityPage<DepositEntity>({
      deleteModal: {
        title: 'Delete Deposit',
        message: () => 'Are you sure you want to delete this deposit?',
        callback: (deposit) =>
          emitLoadingTask(() => portfolioStore.deleteDeposit(deposit.index)),
      },
    });

    const onDepositUpdate = async (deposit: DepositEntity) => {
      await emitLoadingTask(() =>
        portfolioStore.updateDeposit(deposit, deposit.index)
      );
    };

    return {
      deleteEntity,
      onDepositUpdate,
    };
  },
});
</script>
