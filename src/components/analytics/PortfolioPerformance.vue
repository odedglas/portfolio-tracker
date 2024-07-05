<template>
  <q-card flat bordered class="q-my-md">
    <q-card-section>
      <div class="flex justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon name="query_stats" class="text-grey-6 q-mr-sm" size="sm" />
          <p class="text-h6 text-grey-7 q-mb-none">Portfolio performance</p>
        </div>
        <q-btn @click="resetChart" v-if="showResetZoom"> Reset </q-btn>
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
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
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
    const benchmarkData = ref<BenchmarkData[]>([]);

    onMounted(async () => {
      const spyChart = await getQuotesChartData(['SPY', 'QQQ']);

      benchmarkData.value = Object.entries(spyChart).map(([key, value]) => {
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
    });

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
