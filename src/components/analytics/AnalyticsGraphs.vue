<template>
  <benchmarks-selector @update:selected-benchmark="setBenchmarkData" />

  <portfolio-performance
    :title="$t('charts.portfolio_value')"
    :show-transactions-markers="true"
    :benchmarkData="benchmarkData"
  />

  <portfolio-performance
    :title="$t('charts.portfolio_performance')"
    mode="percentage"
    :benchmarkData="benchmarkData"
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

    const { emitLoadingTask } = useLoadingStore();

    const setBenchmarkData = async (tickers: string[]) => {
      await emitLoadingTask(async () => {
        const chartQuotesResponse = await getQuotesChartData(tickers);

        benchmarkData.value = tickers.map(
          (ticker) => chartQuotesResponse[ticker]
        );
      });
    };

    return {
      setBenchmarkData,
      benchmarkData,
      benchmarkOptions,
    };
  },
});
</script>
