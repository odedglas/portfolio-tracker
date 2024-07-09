<template>
  <q-card flat bordered class="q-my-md">
    <q-card-section>
      <div class="flex justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon name="query_stats" class="text-grey-6 q-mr-sm" size="sm" />
          <p class="text-h6 text-grey-7 q-mb-none">Portfolio performance</p>
        </div>
        <div class="flex items-center q-gutter-md">
          <p class="text-body2 text-grey-7 q-mb-none">Benchmarks:</p>
          <q-select
            v-model="selectedBenchmark"
            dense
            multiple
            emit-value
            :options="[
              { label: 'S&P 500', value: 'SPY' },
              { label: 'NASDAQ 100', value: 'QQQ' },
              { label: 'RUSSEL 2000', value: 'IWM' },
            ]"
          />
          <q-btn @click="resetChart" v-if="showResetZoom"> Reset</q-btn>
        </div>
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
import { getQuotesChartData } from 'src/service/stocks';

type BenchmarkData = {
  name: string;
  data: { x: number; y: number }[];
};

export default defineComponent({
  name: 'PortfolioPerformance',
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const showResetZoom = ref(false);
    const chartRef: Ref = ref(undefined);
    const selectedBenchmark: Ref<string[]> = ref(['SPY']);
    const benchmarkData = ref<BenchmarkData[]>([]);

    const setBenchmarkData = async (tickers: string[]) => {
      if (!tickers.length) {
        benchmarkData.value = [];
        return;
      }

      const series = await getQuotesChartData(tickers);

      benchmarkData.value = Object.entries(series).map(([key, value]) => {
        return {
          name: key,
          data: value.close.map((close: number, index: number) => {
            return {
              x: value.timestamp[index],
              y: close,
            };
          }),
        };
      });
    };

    watch(selectedBenchmark, setBenchmarkData, { immediate: true });

    const chartData = computed(() =>
      getPortfolioPerformanceChart(benchmarkData.value, () => {
        if (!showResetZoom.value) {
          showResetZoom.value = true;
        }
      })
    );

    const resetChart = () => {
      const firstSeries = benchmarkData.value[0];

      chartRef.value.zoomX(
        firstSeries.data[0].x,
        firstSeries.data[firstSeries.data.length - 1].x
      );

      showResetZoom.value = false;
    };

    return {
      showResetZoom,
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
