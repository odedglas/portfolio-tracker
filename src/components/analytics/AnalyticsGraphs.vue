<template>
  <benchmarks-selector @update:selected-benchmark="setBenchmarkData" />

  <portfolio-performance
    :title="$t('charts.portfolio_value')"
    :show-transactions-markers="true"
    :benchmarkData="benchmarkData"
    @update:apiRange="onApiRangeChange"
  />

  <portfolio-performance
    :title="$t('charts.portfolio_performance')"
    mode="percentage"
    :benchmarkData="benchmarkData"
    @update:apiRange="onApiRangeChange"
  />

  <portfolio-monthly-yield :benchmark-data="benchmarkData" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import PortfolioPerformance from 'components/analytics/PortfolioPerformance.vue';
import BenchmarksSelector from 'components/analytics/BenchmarksSelector.vue';
import { StockCharData } from 'app/shared/types';
import { useLoadingStore } from 'stores/loading';
import { getQuotesChartData } from 'src/service/stocks';
import { benchmarkOptions } from './constants';
import PortfolioMonthlyYield from 'components/analytics/PortfolioMonthlyYield.vue';

export default defineComponent({
  name: 'AnalyticsGraphs',
  components: {
    PortfolioMonthlyYield,
    BenchmarksSelector,
    PortfolioPerformance,
  },
  setup() {
    const benchmarkData = ref<StockCharData[]>([]);
    const selectedTickers = ref<string[]>([]);
    const currentApiRange = ref<string | undefined>(undefined);

    const { emitLoadingTask } = useLoadingStore();

    const fetchBenchmarkData = async (
      tickers: string[],
      range?: string
    ) => {
      await emitLoadingTask(async () => {
        const chartQuotesResponse = await getQuotesChartData(
          tickers,
          undefined,
          range
        );

        benchmarkData.value = tickers.map(
          (ticker) => chartQuotesResponse[ticker]
        );
      });
    };

    const setBenchmarkData = async (tickers: string[]) => {
      selectedTickers.value = tickers;
      await fetchBenchmarkData(tickers, currentApiRange.value);
    };

    const onApiRangeChange = async (range?: string) => {
      if (range === currentApiRange.value) return;
      currentApiRange.value = range;

      if (selectedTickers.value.length > 0) {
        await fetchBenchmarkData(selectedTickers.value, range);
      }
    };

    return {
      setBenchmarkData,
      onApiRangeChange,
      benchmarkData,
      benchmarkOptions,
    };
  },
});
</script>
