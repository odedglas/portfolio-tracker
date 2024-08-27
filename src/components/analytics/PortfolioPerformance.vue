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
      <div class="flex items-center q-gutter-md">
        <q-btn @click="resetChart" v-if="showResetZoom" flat>{{
          $t('reset')
        }}</q-btn>
      </div>
    </q-card-section>
    <q-card-section>
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
import VueApexCharts from 'vue3-apexcharts';
import { getPortfolioPerformanceChart } from 'src/service/charts';
import { StockChartResponse } from 'app/shared/types';
import { getQuotesChartData } from 'src/service/stocks';
import { usePortfolioStore } from 'stores/portfolios';
import { useI18n } from 'vue-i18n';

type Option = { label: string; value: string };

const benchmarkOptions: Option[] = [
  { label: 'S&P 500', value: 'SPY' },
  { label: 'NASDAQ 100', value: 'QQQ' },
  { label: 'RUSSEL 2000', value: 'IWM' },
];

export default defineComponent({
  name: 'PortfolioPerformance',
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const showResetZoom = ref(false);
    const chartRef: Ref = ref(undefined);
    const selectedBenchmark: Ref<Option[]> = ref([benchmarkOptions[0]]);
    const benchmarkData = ref<StockChartResponse>({});

    const $n = useI18n().n;
    const portfolioStore = usePortfolioStore();

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
        $n,
        () => {
          if (!showResetZoom.value) {
            showResetZoom.value = true;
          }
        }
      )
    );

    const resetChart = () => {
      const history = portfolioStore.history;

      chartRef.value.zoomX(history[0].date, history[history.length - 1].date);

      showResetZoom.value = false;
    };

    return {
      showResetZoom,
      benchmarkOptions,
      resetChart,
      selectedBenchmark,
      chartRef,
      chartData,
    };
  },
});
</script>

<style lang="scss">
.holdings-heat-map {
  svg {
    transform: translate(8px, 0) !important;
  }
}
</style>
