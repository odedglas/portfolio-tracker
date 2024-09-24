<template>
  <q-card flat bordered class="q-my-md portfolio-performance-card">
    <q-card-section>
      <div class="flex justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon name="query_stats" class="text-grey-6 q-mr-sm" size="sm" />
          <p class="text-h6 text-grey-7 q-mb-none">
            {{ $t('charts.portfolio_performance') }}
          </p>
        </div>
        <div class="flex items-center q-gutter-md">
          <p class="text-body2 text-grey-7 q-mb-none">
            {{ $t('charts.benchmarks') }}:
          </p>
          <q-select
            v-model="selectedBenchmark"
            dense
            multiple
            :options="benchmarkOptions"
          />
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
              <numeric-value :value="totalValue.value" />
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
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue';
import { date as DateAPI } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import { getPortfolioPerformanceChart } from 'src/service/charts';
import { StockChartResponse } from 'app/shared/types';
import { getQuotesChartData } from 'src/service/stocks';
import { usePortfolioStore } from 'stores/portfolios';
import { useI18n } from 'vue-i18n';
import {
  buildDateRangeFromToday,
  yearToDateDays,
} from 'src/service/stocks/dates';
import { SERIES_COLORS_PALLET } from 'src/service/charts/constants';
import NumericValue from 'components/common/NumericValue.vue';

type Option = { label: string; value: string; [key: string]: unknown };

const benchmarkOptions: Option[] = [
  { label: 'S&P 500', value: 'SPY' },
  { label: 'NASDAQ 100', value: 'QQQ' },
  { label: 'RUSSEL 2000', value: 'IWM' },
];

const timeRangeOptions: Option[] = [
  { label: '7d', value: '5d', days: 7 },
  { label: '1m', value: '1m', days: 30 },
  { label: '3m', value: '3m', days: 90 },
  { label: '6m', value: '6m', days: 180 },
  { label: 'YTD', value: 'ytd', days: yearToDateDays() },
  { label: '1y', value: '1y', days: 365 },
  { label: '5y', value: '5y', days: 365 * 5 },
];

export default defineComponent({
  name: 'PortfolioPerformance',
  components: {
    NumericValue,
    apexchart: VueApexCharts,
  },
  setup() {
    const showResetZoom = ref(false);
    const chartRef: Ref = ref(undefined);
    const selectedBenchmark: Ref<Option[]> = ref([benchmarkOptions[0]]);
    const benchmarkData = ref<StockChartResponse>({});
    const selectedTimeRangeOption = ref<Option>(timeRangeOptions[2]);

    const $n = useI18n().n;
    const portfolioStore = usePortfolioStore();

    const periodTimeRange = computed(() => {
      const portfolioHistoryStartDate = portfolioStore.history[0]?.date;

      if (!portfolioHistoryStartDate) {
        return [];
      }

      const days = selectedTimeRangeOption.value.days;

      return buildDateRangeFromToday(days as number).filter(
        (date) => date >= portfolioHistoryStartDate
      );
    });

    const setBenchmarkData = async (tickerOptions: Option[]) => {
      benchmarkData.value = await getQuotesChartData(
        tickerOptions.map((ticker) => ticker.value)
      );
    };

    watch(selectedBenchmark, setBenchmarkData, { immediate: true });

    const chartData = computed(() =>
      getPortfolioPerformanceChart(
        portfolioStore.history,
        benchmarkData.value,
        periodTimeRange.value,
        $n,
        () => {
          if (!showResetZoom.value) {
            showResetZoom.value = true;
          }
        }
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
      const series = chartData.value.series;

      return series.map((serie, index) => ({
        value: serie.data[serie.data.length - 1].y - serie.data[0].y,
        name: serie.name,
        style: {
          background: SERIES_COLORS_PALLET[index],
          color: SERIES_COLORS_PALLET[index],
        },
      }));
    });

    return {
      showResetZoom,
      benchmarkOptions,
      resetChart,
      timeRangeOptions,
      selectedTimeRangeOption,
      selectedBenchmark,
      chartRef,
      chartData,
      selectTimeRange,
      timeRangeText,
      seriesTotalValues,
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

.holdings-heat-map {
  svg {
    transform: translate(8px, 0) !important;
  }
}
</style>
