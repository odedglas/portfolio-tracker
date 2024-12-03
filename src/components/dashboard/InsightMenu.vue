<template>
  <q-menu
    auto-close
    class="q-py-md flex column q-gap-lg"
    @hide="$emit('close')"
    :value="show"
  >
    <span class="text-subtitle2 q-px-md">Insight historical price trend</span>
    <div class="q-px-md">
      <apexchart
        :options="chartData"
        :height="chartData.chart.height"
        :width="chartData.chart.width"
        :series="chartData.series"
        class="holdings-heat-map"
      ></apexchart>
    </div>
  </q-menu>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { ViewPortfolioInsight } from 'app/shared/types';
import { buildDateRangeFromToday } from 'src/service/stocks/dates';
import { useNumberFormatter } from 'components/composables/useNumberFormatter';
import { insightSparklineChartData } from 'src/service/charts/insightSparkline';

export default defineComponent({
  name: 'InsightMenu',
  components: {
    apexchart: VueApexCharts,
  },
  emits: ['close'],
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    insight: {
      type: Object as PropType<ViewPortfolioInsight>,
      required: true,
    },
  },
  setup(props) {
    const formatter = useNumberFormatter();

    const triggerPrice = 135.26;

    // TODO - Migrate this truly to insight inputs once data is gathered.
    const dates = buildDateRangeFromToday(11);
    const values = [100, 179, 168.32, 156, 133, 105, 131, 133, 157, 144, 187];

    const chartData = insightSparklineChartData({
      insight: {
        ...props.insight,
        historyInputs: values.map((value, index) => ({
          date: dates[index],
          inputs: { regularMarketPrice: value },
        })),
      },
      triggerPrice,
      formatter,
    });

    return {
      chartData,
    };
  },
});
</script>
