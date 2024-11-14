<template>
  <base-dialog
    :show="show"
    @close="$emit('close')"
    :on-submit="submitForm"
    :title="isNew ? 'Create Alert' : `Edit Alert`"
    :before-show="setLocalPlan"
  >
    <ticker-search
      :ticker="localAlert.ticker || ''"
      :disabled="!isNew"
      :ticker-meta="{
        display: localAlert.ticker,
        logo: localAlert.logoImage,
      }"
      @update:tickerValue="onTickerOptionSelect"
    />

    <q-select
      v-model="localAlert.valueProperty"
      emit-value
      :display-value="
        valuePropertyOptions.find(
          (opt) => opt.value === localAlert?.valueProperty
        )?.label ?? ''
      "
      :options="valuePropertyOptions"
      label="Property"
    />

    <q-select
      v-model="localAlert.condition"
      emit-value
      :display-value="
        conditionOptions.find((opt) => opt.value === localAlert?.condition)
          ?.label ?? ''
      "
      :options="conditionOptions"
      label="Condition"
    />

    <q-input
      v-model.number="localAlert.value"
      type="number"
      lazy-rules
      label="Value"
    />

    <date-input
      :date="localAlert.expiration"
      @date-change="(date) => (localAlert.expiration = date)"
    />

    <div class="flex justify-between">
      <q-toggle v-model="localAlert.once" label="Trigger once" />
      <q-separator vertical />

      <q-toggle v-model="localAlert.active" label="Active" class="q-pr-md" />
    </div>
    <q-separator />
  </base-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, toRef, Ref } from 'vue';
import { date as dateUtils } from 'quasar';
import { useLoadingStore } from 'stores/loading';
import { Alert } from 'app/shared/types';
import TickerSearch, { TickerOption } from 'components/common/TickerSearch.vue';
import BaseDialog from 'components/common/BaseDialog.vue';
import alertsAPI from 'src/service/alert';
import { usePortfolioStore } from 'stores/portfolios';
import DateInput from 'components/common/DateInput.vue';

const emptyAlert = (): Alert => {
  const portfolio = usePortfolioStore().selectedPortfolio;

  if (!portfolio) {
    throw new Error('No portfolio!');
  }

  return {
    id: '',
    ticker: '',
    value: 0,
    active: true,
    once: true,
    logoImage: '',
    condition: 'gt',
    valueProperty: 'regularMarketPrice',
    expiration: dateUtils.addToDate(new Date(), { years: 1 }).getTime(),
    portfolioId: portfolio.id,
    owner: portfolio.owner,
  };
};

export default defineComponent({
  name: 'AlertDialog',
  components: { DateInput, BaseDialog, TickerSearch },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    alert: {
      type: Object as PropType<Alert | undefined>,
    },
  },
  emits: ['close'],
  setup(props) {
    const { emitLoadingTask } = useLoadingStore();

    const conditionOptions = [
      { label: 'Greater Than', value: 'gt' },
      { label: 'Less Than', value: 'lt' },
    ];

    const valuePropertyOptions = [
      { label: 'Regular Market Price', value: 'regularMarketPrice' },
      { label: '500 days moving AVG', value: 'fiftyDayAverage' },
      { label: '200 days moving AVG', value: 'twoHundredDayAverage' },
    ];

    const localAlert = toRef(props.alert) as Ref<Alert>;

    const isNew = computed(() => localAlert?.value?.id === '');

    const setLocalPlan = () => {
      localAlert.value = {
        ...(props.alert || emptyAlert()),
      };
    };

    const submitForm = async () => {
      await emitLoadingTask(async () => {
        await alertsAPI.update(localAlert.value);
      });
    };

    const onTickerOptionSelect = (tickerOption: TickerOption) => {
      localAlert.value.ticker = tickerOption?.value || '';
      localAlert.value.logoImage = tickerOption?.logoImage ?? '';
    };

    return {
      isNew,
      localAlert,
      setLocalPlan,
      submitForm,
      onTickerOptionSelect,
      conditionOptions,
      valuePropertyOptions,
    };
  },
});
</script>
