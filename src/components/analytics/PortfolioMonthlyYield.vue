<template>
  <q-card
    flat
    :bordered="appearanceStore.borderedCards"
    class="portfolio-monthly-yields"
  >
    <q-card-section class="q-pa-sm q-pa-md-md">
      <div class="flex justify-between">
        <div class="flex items-center q-mr-sm">
          <q-icon
            name="account_balance"
            class="text-grey-6 q-mr-sm"
            size="sm"
          />
          <p class="text-h6 text-grey-7 q-mb-none">
            {{ $t('charts.monthly_yield') }}
          </p>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none q-px-none q-px-md-md">
      <apexchart
        ref="chartRef"
        :type="chartData.options.chart.type"
        :height="chartData.options.chart.height"
        :options="chartData.options"
        :series="chartData.series"
      ></apexchart>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { StockCharData } from 'app/shared/types';
import { usePortfolioStore } from 'stores/portfolios';
import { timeRangeOptions } from './constants';
import { useNumberFormatter } from 'components/composables/useNumberFormatter';
import { useAppearanceStore } from 'stores/appearance';
import { getPortfolioMonthlyYieldChartData } from 'src/service/charts';

export default defineComponent({
  name: 'PortfolioMonthlyYield',
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    benchmarkData: {
      type: Array as PropType<StockCharData[]>,
      default: [] as StockCharData[],
    },
  },
  setup(props) {
    const numberFormatter = useNumberFormatter();
    const portfolioStore = usePortfolioStore();
    const appearanceStore = useAppearanceStore();

    const chartData = computed(() =>
      getPortfolioMonthlyYieldChartData(
        portfolioStore.history,
        props.benchmarkData,
        numberFormatter
      )
    );

    return {
      timeRangeOptions,
      chartData,
      appearanceStore,
    };
  },
});
</script>
