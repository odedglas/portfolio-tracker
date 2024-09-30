<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column analytics-page-wrapper">
      <p class="text-h5 text-grey-7 dashboard-title">Analytics</p>
      <div class="flex analytics-kpis-wrapper">
        <dashboard-kpi
          v-for="kpi in kpis"
          :key="kpi.title"
          v-bind="kpi"
          class="col"
        />
      </div>

      <q-card flat bordered>
        <q-card-section class="q-py-sm">
          <div>
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
        </q-card-section>
      </q-card>

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
import { defineComponent, ref, Ref, watch } from 'vue';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import { usePortfolioKpis } from 'components/composables/usePortfolioKpis';
import { benchmarkOptions, Option } from 'components/analytics/constants';
import { StockChartResponse } from 'app/shared/types';
import { useLoadingStore } from 'stores/loading';
import { getQuotesChartData } from 'src/service/stocks';
import PortfolioPerformance from 'components/analytics/PortfolioPerformance.vue';

export default defineComponent({
  name: 'AnalyticsPage',
  components: {
    PortfolioPerformance,
    DashboardKpi,
  },
  setup() {
    const selectedBenchmark: Ref<Option[]> = ref([benchmarkOptions[0]]);
    const benchmarkData = ref<StockChartResponse>({});

    const { kpis } = usePortfolioKpis();
    const { emitLoadingTask } = useLoadingStore();

    const setBenchmarkData = async (tickerOptions: Option[]) => {
      selectedBenchmark.value = tickerOptions;

      await emitLoadingTask(async () => {
        benchmarkData.value = await getQuotesChartData(
          tickerOptions.map((ticker) => ticker.value)
        );
      });
    };

    watch(selectedBenchmark, setBenchmarkData, { immediate: true });

    return {
      kpis,
      selectedBenchmark,
      setBenchmarkData,
      benchmarkData,
      benchmarkOptions,
    };
  },
});
</script>

<style lang="scss">
.analytics-page-wrapper {
  gap: 24px;
}

.analytics-kpis-wrapper {
  gap: 16px;
}
</style>
