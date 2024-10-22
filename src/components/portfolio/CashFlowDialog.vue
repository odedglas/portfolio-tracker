<template>
  <q-dialog
    v-model="syntheticShow"
    backdrop-filter="blur(4px)"
    @before-show="clearLocalCashFlow"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="row items-center">
            <q-icon name="attach_money" class="q-mr-md" />
            New Cash Flow
          </q-toolbar-title>
          <q-space />
          <q-btn flat round dense icon="close" @click="$emit('close')" />
        </q-toolbar>
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-sm">
          <q-select
            v-model="localCashFlowEntry.type"
            emit-value
            :display-value="
              cashTypeOptions.find(
                (opt) => opt.value === localCashFlowEntry.type
              )?.label ?? ''
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
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('cancel')" @click="$emit('close')" />
        <q-btn
          color="primary"
          type="submit"
          :label="$t('save')"
          @click="submitForm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from 'vue';
import { useLoadingStore } from 'stores/loading';
import { usePortfolioStore } from 'src/stores/portfolios';
import { DepositEntity } from 'app/shared/types';
import { useI18n } from 'vue-i18n';
import DateInput from 'components/common/DateInput.vue';

const emptyDeposit = (): DepositEntity => ({
  id: '',
  index: 0,
  date: Date.now(),
  value: 0,
  type: 'deposit',
});

export default defineComponent({
  name: 'CashFlowDialog',
  components: { DateInput },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const $t = useI18n().t;
    const portfolioStore = usePortfolioStore();
    const { emitLoadingTask } = useLoadingStore();

    const formRef: Ref<{ validate: () => void } | undefined> = ref(undefined);
    const localCashFlowEntry: Ref<Partial<DepositEntity>> = ref(emptyDeposit());

    const cashTypeOptions = [
      { label: $t('deposit'), value: 'deposit' },
      { label: $t('withdrawal'), value: 'withdrawal' },
      { label: $t('balance'), value: 'balance' },
    ];

    const syntheticShow = computed({
      get: () => props.show,
      set: (value: boolean) => {
        if (!value) {
          emit('close', undefined);
        }
      },
    });

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
      if (await formRef.value?.validate()) {
        await saveCashFlow();
        emit('close');
      }
    };

    const clearLocalCashFlow = () => {
      localCashFlowEntry.value = emptyDeposit();
    };

    return {
      formRef,
      syntheticShow,
      localCashFlowEntry,
      submitForm,
      clearLocalCashFlow,
      cashTypeOptions,
    };
  },
});
</script>
