<template>
  <q-menu
    auto-close
    class="q-py-md flex column q-gap-lg overflow-hidden"
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

    const chartData = insightSparklineChartData({
      insight: props.insight,
      formatter,
    });

    return {
      chartData,
    };
  },
});
</script>
