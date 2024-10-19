<template>
  <q-card flat bordered class="portfolio-performance-card">
    <q-card-section>
      <div class="flex justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon
            :name="ModeIconMap[mode]"
            class="text-grey-6 q-mr-sm"
            size="sm"
          />
          <p class="text-h6 text-grey-7 q-mb-none">
            {{ title }}
          </p>
        </div>
      </div>
      <div
        class="flex items-center q-gutter-md q-my-xs text-grey-8 justify-between text-caption"
      >
        <div>
          <q-btn
            v-for="option in timeRangeOptions"
            :key="option.value"
            :class="
              selectedTimeRangeOption.value === option.value ? 'active' : ''
            "
            @click="() => selectTimeRange(option)"
            round
            flat
            size="sm"
          >
            {{ option.label }}
          </q-btn>
          <q-btn
            @click="resetChart"
            v-if="showResetZoom"
            flat
            no-caps
            size="sm"
            color="primary"
            icon="zoom_out_map"
            >{{ $t('zoom_out') }}</q-btn
          >
        </div>
        <div class="q-px-md flex items-center">
          <div class="flex">
            <span
              v-for="(totalValue, index) in seriesTotalValues"
              :key="index"
              class="q-mx-sm flex items-center"
            >
              <span class="data-label q-mr-sm" :style="totalValue.style" />
              <numeric-value
                :value="totalValue.value"
                :format="totalValue.format"
              />
              <q-tooltip>
                {{ totalValue.name }}
              </q-tooltip>
            </span>
          </div>
          <q-item-label>
            {{ timeRangeText }}
          </q-item-label>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <apexchart
        ref="chartRef"
        height="500"
        type="area"
        :options="chartData.options"
        :series="chartData.series"
      ></apexchart>
    </q-card-section>

    <q-menu
      anchor="top start"
      self="bottom left"
      class="marker-menu"
      :target="markerMenuTargetEl"
      :model-value="!!markerMenuTargetEl"
      @update:modelValue="clearMarkerMenu"
    >
      <div class="q-px-md q-py-sm text-caption">
        <b>{{ markerMenu.title }}</b
        >, transactions: {{ markerMenu.total }}
      </div>
      <q-separator />
      <div class="q-px-md q-py-sm">
        <p
          v-for="transaction in markerMenu.transactions"
          :key="transaction.id"
          class="transaction-row flex items-center"
        >
          <q-item-label
            :class="`text-capitalize text-bold ${
              transaction.action === 'buy' ? 'text-green-6' : 'text-red-6'
            }`"
            >{{ transaction.action }}</q-item-label
          >
          <q-item-label class="text-bold"
            >{{ transaction.ticker }}:</q-item-label
          >
          <q-item-label caption
            >{{ transaction.shares }} shares for
            {{ $n(transaction.price, 'decimal') }}</q-item-label
          >
        </p>
      </div>
    </q-menu>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref, watch } from 'vue';
import { date as DateAPI } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import { getPortfolioPerformanceChart } from 'src/service/charts';
import { StockChartResponse, Transaction } from 'app/shared/types';
import { usePortfolioStore } from 'stores/portfolios';
import { buildDateRangeFromToday, midDay } from 'src/service/stocks/dates';
import { SERIES_COLORS_PALLET } from 'src/service/charts/constants';
import NumericValue from 'components/common/NumericValue.vue';
import { useTransactionsStore } from 'stores/transactions';
import { Option, timeRangeOptions } from './constants';
import { useNumberFormatter } from 'components/composables/useNumberFormatter';

const ModeIconMap: Record<'value' | 'percentage', string> = {
  value: 'query_stats',
  percentage: 'percent',
};

export default defineComponent({
  name: 'PortfolioPerformance',
  components: {
    NumericValue,
    apexchart: VueApexCharts,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    mode: {
      type: String as PropType<'value' | 'percentage'>,
      default: 'value',
    },
    showTransactionsMarkers: {
      type: Boolean,
      default: false,
    },
    benchmarkData: {
      type: Object as PropType<StockChartResponse>,
      default: {} as StockChartResponse,
    },
  },
  setup(props) {
    const showResetZoom = ref(false);
    const chartRef: Ref = ref(undefined);
    const selectedTimeRangeOption = ref<Option>(timeRangeOptions[2]);
    const markerMenuTargetEl = ref<Element | undefined>(undefined);
    const selectedAnnotationDate = ref<number | undefined>(undefined);

    const numberFormatter = useNumberFormatter();
    const portfolioStore = usePortfolioStore();
    const transactionsStore = useTransactionsStore();

    const periodTimeRange = computed(() => {
      if (!portfolioStore.history[0]?.date) {
        return [];
      }

      const portfolioHistoryStartDate = midDay(
        new Date(portfolioStore.history[0]?.date)
      ).getTime();

      const days = selectedTimeRangeOption.value.days;

      return buildDateRangeFromToday(days as number).filter(
        (date) => date >= portfolioHistoryStartDate
      );
    });

    const groupedTransactions = computed(() =>
      transactionsStore.transactions.reduce((acc, transaction) => {
        const transactionDate = midDay(new Date(transaction.date)).getTime();
        const existingTransactions = acc.get(transactionDate) ?? [];

        return acc.set(transactionDate, [...existingTransactions, transaction]);
      }, new Map<number, Transaction[]>())
    );

    const chartData = computed(() =>
      getPortfolioPerformanceChart(
        portfolioStore.history,
        props.benchmarkData,
        periodTimeRange.value,
        props.showTransactionsMarkers ? groupedTransactions.value : new Map(),
        numberFormatter,
        () => {
          if (!showResetZoom.value) {
            showResetZoom.value = true;
          }
        },
        props.mode
      )
    );

    const resetChart = () => {
      chartRef.value.zoomX(
        periodTimeRange.value[0],
        periodTimeRange.value[periodTimeRange.value.length - 1]
      );

      showResetZoom.value = false;
    };

    const selectTimeRange = (range: Option) => {
      selectedTimeRangeOption.value =
        timeRangeOptions.find((option) => option.value === range.value) ??
        timeRangeOptions[0];
    };

    const timeRangeText = computed(() => {
      const start = periodTimeRange.value[0];
      const end = periodTimeRange.value[periodTimeRange.value.length - 1];

      return `${DateAPI.formatDate(start, 'MMM D, YY')} - ${DateAPI.formatDate(
        end,
        'MMM D, YY'
      )}`;
    });

    const seriesTotalValues = computed(() => {
      const isPercentage = props.mode === 'percentage';

      const series = chartData.value.series;

      return series.map((serie, index) => ({
        value: serie.data[serie.data.length - 1].y - serie.data[0].y,
        format: isPercentage ? 'percent' : 'currency',
        name: serie.name,
        style: {
          background: SERIES_COLORS_PALLET[index],
          color: SERIES_COLORS_PALLET[index],
        },
      }));
    });

    const clearMarkerMenu = () => {
      markerMenuTargetEl.value = undefined;
      selectedAnnotationDate.value = undefined;
    };

    watch(
      [showResetZoom.value, periodTimeRange],
      () => {
        setTimeout(() => {
          const annotations = document.querySelectorAll(
            '.apexcharts-point-annotation-marker'
          );

          annotations.forEach((annotation, index) => {
            if (!!annotation.getAttribute('data-marker-menu')) {
              return;
            }

            const annotationDateKey = [...groupedTransactions.value.keys()][
              index
            ];

            const showMarkerMenu = (event: Event) => {
              markerMenuTargetEl.value = event.target as Element;
              selectedAnnotationDate.value = annotationDateKey;
            };

            annotation.addEventListener('mouseover', showMarkerMenu);
            annotation.addEventListener('mouseout', clearMarkerMenu);

            annotation.setAttribute('data-marker-menu', 'true');
          });
        }, 1000);
      },
      { immediate: true }
    );

    const markerMenu = computed(() => {
      const transactions = groupedTransactions.value.get(
        selectedAnnotationDate.value ?? 0
      );
      if (!selectedAnnotationDate.value) {
        return {};
      }

      return {
        title: DateAPI.formatDate(selectedAnnotationDate.value, 'MMM D, YY'),
        total: transactions?.length,
        transactions,
      };
    });

    return {
      resetChart,
      timeRangeOptions,
      chartRef,
      chartData,
      selectTimeRange,
      timeRangeText,
      selectedTimeRangeOption,
      showResetZoom,
      seriesTotalValues,
      ModeIconMap,
      markerMenuTargetEl,
      clearMarkerMenu,
      markerMenu,
    };
  },
});
</script>

<style lang="scss">
.portfolio-performance-card {
  .q-btn.active {
    color: $blue-6;

    .q-focus-helper {
      background: currentColor;
      opacity: 0.15;
    }
  }

  .data-label {
    height: 12px;
    width: 12px;
    left: 0;
    top: 0;
    border-width: 0;
    border-color: rgb(255, 255, 255);
    border-radius: 12px;
    display: inline-block;
  }
}

.marker-menu {
  .transaction-row {
    gap: 4px;
    margin-bottom: 8px;

    .q-item__label + .q-item__label {
      margin-top: 0;
    }
  }
}
</style>
