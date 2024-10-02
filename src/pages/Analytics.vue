<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column analytics-page-wrapper">
      <p class="text-h5 q-mb-none text-grey-7 dashboard-title">Analytics</p>
      <div class="analytics-kpis-wrapper">
        <dashboard-kpi
          v-for="kpi in kpis"
          :key="`analytics-${kpi.title}`"
          v-bind="kpi"
        />
      </div>

      <benchmarks-selector @update:selected-benchmark="setBenchmarkData" />

      <portfolio-performance
        :title="$t('charts.portfolio_value')"
        :benchmarkData="benchmarkData"
      />

      <portfolio-performance
        :title="$t('charts.portfolio_performance')"
        mode="percentage"
        :benchmarkData="benchmarkData"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import { usePortfolioKpis } from 'components/composables/usePortfolioKpis';
import { benchmarkOptions } from 'components/analytics/constants';
import { StockChartResponse } from 'app/shared/types';
import { useLoadingStore } from 'stores/loading';
import { getQuotesChartData } from 'src/service/stocks';
import PortfolioPerformance from 'components/analytics/PortfolioPerformance.vue';
import BenchmarksSelector from 'components/analytics/BenchmarksSelector.vue';

export default defineComponent({
  name: 'AnalyticsPage',
  components: {
    PortfolioPerformance,
    BenchmarksSelector,
    DashboardKpi,
  },
  setup() {
    const benchmarkData = ref<StockChartResponse>({});

    const { kpis } = usePortfolioKpis();
    const { emitLoadingTask } = useLoadingStore();

    const setBenchmarkData = async (tickers: string[]) => {
      await emitLoadingTask(async () => {
        benchmarkData.value = await getQuotesChartData(tickers);
      });
    };

    return {
      kpis,
      setBenchmarkData,
      benchmarkData,
      benchmarkOptions,
    };
  },
});
</script>

<style lang="scss">
.analytics-page-wrapper {
  gap: 16px;
}

.analytics-kpis-wrapper {
  display: grid;
  gap: 16px;
  grid-template-rows: repeat(1, auto);
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas: 'kpi kpi kpi';
}
</style>
