<template>
  <base-dialog
    :show="show"
    @close="$emit('close')"
    :on-submit="submitForm"
    title="New Cash Flow"
    :before-show="clearLocalCashFlow"
  >
    <q-select
      v-model="localCashFlowEntry.type"
      emit-value
      :display-value="
        cashTypeOptions.find((opt) => opt.value === localCashFlowEntry.type)
          ?.label ?? ''
      "
      :options="cashTypeOptions"
    />

    <q-input
      v-model.number="localCashFlowEntry.value"
      type="number"
      lazy-rules
      label="Amount"
      :rules="[(val) => !!val || 'Please enter a valid amount']"
    />

    <date-input
      :date="localCashFlowEntry.date ?? 0"
      @date-change="(date) => (localCashFlowEntry.date = date)"
    />

    <q-input
      v-model="localCashFlowEntry.notes"
      dense
      placeholder="Notes"
      autofocus
    />
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'src/stores/portfolios';
import { DepositEntity } from 'app/shared/types';
import { useI18n } from 'vue-i18n';
import DateInput from 'components/common/DateInput.vue';
import BaseDialog from 'components/common/BaseDialog.vue';

const emptyDeposit = (): DepositEntity => ({
  id: '',
  index: 0,
  date: Date.now(),
  value: 0,
  type: 'deposit',
});

export default defineComponent({
  name: 'CashFlowDialog',
  components: { BaseDialog, DateInput },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close'],
  setup() {
    const $t = useI18n().t;
    const portfolioStore = usePortfolioStore();
    const { emitLoadingTask } = useLoadingStore();

    const localCashFlowEntry: Ref<Partial<DepositEntity>> = ref(emptyDeposit());

    const cashTypeOptions = [
      { label: $t('deposit'), value: 'deposit' },
      { label: $t('withdrawal'), value: 'withdrawal' },
      { label: $t('balance'), value: 'balance' },
    ];

    const saveCashFlow = async () => {
      const existingDeposits =
        portfolioStore.selectedPortfolio?.deposits.length ?? 0;

      await emitLoadingTask(() =>
        portfolioStore.updateDeposit(
          localCashFlowEntry.value as DepositEntity,
          existingDeposits
        )
      );
    };

    const submitForm = async () => {
      await saveCashFlow();
    };

    const clearLocalCashFlow = () => {
      localCashFlowEntry.value = emptyDeposit();
    };

    return {
      localCashFlowEntry,
      submitForm,
      clearLocalCashFlow,
      cashTypeOptions,
    };
  },
});
</script>
