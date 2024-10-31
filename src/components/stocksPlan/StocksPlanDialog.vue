<template>
  <base-dialog
    :show="show"
    @close="$emit('close')"
    :on-submit="submitForm"
    :title="
      isNew
        ? $t('stocks_plans.new')
        : `${$t('stocks_plans.edit')}: ${localPlan.identifier}`
    "
    :before-show="setLocalPlan"
  >
    <ticker-search
      :ticker="localPlan.ticker || ''"
      :disabled="!isNew"
      :ticker-meta="{
        display: localPlan.name,
        logo: localPlan.logoImage,
      }"
      @update:tickerValue="onTickerOptionSelect"
    />

    <div class="row" style="gap: 12px">
      <q-input
        v-model="localPlan.identifier"
        class="col"
        type="text"
        lazy-rules
        label="Grant name"
        :rules="[
          (val) => (val && val.length > 0) || 'Please enter a uniq grant name',
        ]"
      />

      <q-select
        v-model="localPlan.type"
        class="col text-capitalize"
        :options="[
          { label: $t('stocks_plans.rsu'), value: 'rsu' },
          { label: $t('stocks_plans.espp'), value: 'espp' },
          { label: $t('stocks_plans.esop'), value: 'esop' },
        ]"
        :emit-value="true"
        label="Plan type"
      />
    </div>

    <div class="row" style="gap: 12px">
      <q-input
        v-model.number="localPlan.grantPrice"
        class="col"
        type="number"
        lazy-rules
        suffix="$"
        label="Grant Price"
        :rules="[
          (val) => (val && val > 0) || 'Please enter a valid grant price',
        ]"
      />

      <q-input
        class="col"
        v-model="formattedGrantDate"
        label="Granting Date"
        lazy-rules
        :rules="[
          (val) =>
            (val && typeof new Date(val).getTime === 'function') ||
            'Please set a valid date',
        ]"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="formattedGrantDate" mask="MMM D, YYYY">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <q-input
      v-model.number="localPlan.amount"
      class="col"
      type="number"
      lazy-rules
      label="Stocks amount"
    />

    <q-input
      :model-value="vestingYears"
      @update:model-value="(v) => onVestingYearsChange(Number(v))"
      class="col"
      type="number"
      :disable="isESPP"
      lazy-rules
      label="Grant Vesting years"
    />

    <q-toggle
      v-model="localPlan.cliff"
      :disable="isESPP"
      label="Plan has cliff constraint?"
    />
  </base-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  ref,
  toRef,
  Ref,
  watch,
} from 'vue';
import { date as dateUtils } from 'quasar';
import { useLoadingStore } from 'stores/loading';
import { StocksPlan } from 'app/shared/types';
import { formatPlanDate } from 'src/service/date';
import TickerSearch, { TickerOption } from 'components/common/TickerSearch.vue';
import { useStocksPlansStore } from 'stores/stocksPlans';
import BaseDialog from 'components/common/BaseDialog.vue';

const emptyPlan = (): StocksPlan => ({
  id: '',
  amount: 0,
  grantDate: 0,
  grantPrice: 0,
  identifier: '',
  name: '',
  ticker: '',
  type: 'rsu',
  vestingEndDate: 0,
  vestingMonthsInterval: 3,
  cliff: true,
  orders: [],
});

export default defineComponent({
  name: 'StocksPlanDialog',
  components: { BaseDialog, TickerSearch },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    plan: {
      type: Object as PropType<StocksPlan | undefined>,
    },
  },
  emits: ['close'],
  setup(props) {
    const vestingYears = ref(4);
    const { emitLoadingTask } = useLoadingStore();
    const stocksPlansStore = useStocksPlansStore();

    const localPlan = toRef(props.plan) as Ref<StocksPlan>;

    const isNew = computed(() => localPlan?.value?.id === '');

    const formattedGrantDate = computed({
      get: () => {
        const grantDate = localPlan.value.grantDate;

        if (!grantDate) return undefined;

        return formatPlanDate(localPlan.value.grantDate);
      },
      set: (date: string) => {
        localPlan.value.grantDate = new Date(date).getTime();
      },
    });

    const isESPP = computed(() => localPlan.value?.type === 'espp');

    watch(isESPP, () => {
      vestingYears.value = isESPP.value ? 0 : 4;
      localPlan.value.cliff = !isESPP.value;
    });

    const setLocalPlan = () => {
      localPlan.value = {
        ...(props.plan || emptyPlan()),
      };
    };

    const setVestingEndDate = (yearsFromNow: number) => {
      localPlan.value.vestingEndDate = dateUtils
        .addToDate(localPlan.value.grantDate, { years: yearsFromNow })
        .setHours(0);
    };

    const submitForm = async () => {
      localPlan.value.grantDate = new Date(localPlan.value.grantDate).setHours(
        0
      );
      localPlan.value.id = localPlan.value.identifier;
      setVestingEndDate(vestingYears.value);

      const plan = localPlan.value;

      await emitLoadingTask(async () => {
        await stocksPlansStore.updateStocksPlan(plan);
      });
    };

    const onTickerOptionSelect = (tickerOption: TickerOption) => {
      localPlan.value.ticker = tickerOption?.value || '';
      localPlan.value.name = tickerOption?.label;
      localPlan.value.logoImage = tickerOption?.logoImage;
      localPlan.value.grantPrice = tickerOption?.lastPrice ?? 0;
    };

    const onVestingYearsChange = (years: number) => {
      vestingYears.value = years;
      setVestingEndDate(years);
    };

    return {
      isNew,
      localPlan,
      setLocalPlan,
      submitForm,
      onTickerOptionSelect,
      formattedGrantDate,
      vestingYears,
      onVestingYearsChange,
      isESPP,
    };
  },
});
</script>
