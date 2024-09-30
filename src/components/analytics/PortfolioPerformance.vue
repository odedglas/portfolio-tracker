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
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, Ref, ref } from 'vue';
import { date as DateAPI } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import { getPortfolioPerformanceChart } from 'src/service/charts';
import { StockChartResponse } from 'app/shared/types';
import { usePortfolioStore } from 'stores/portfolios';
import { useI18n } from 'vue-i18n';
import { buildDateRangeFromToday, midDay } from 'src/service/stocks/dates';
import { SERIES_COLORS_PALLET } from 'src/service/charts/constants';
import NumericValue from 'components/common/NumericValue.vue';
import { useTransactionsStore } from 'stores/transactions';
import { Option, timeRangeOptions } from './constants';

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

    const $n = useI18n().n;
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

    const chartData = computed(() =>
      getPortfolioPerformanceChart(
        portfolioStore.history,
        props.benchmarkData,
        periodTimeRange.value,
        props.showTransactionsMarkers ? transactionsStore.transactions : [],
        $n,
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
</style>
