<template>
  <q-card flat :bordered="appearanceStore.borderedCards" class="q-mt-lg">
    <q-card-section class="flex items-center q-pa-sm q-pa-md-md">
      <q-icon
        name="local_fire_department"
        class="dashboard-icon q-mr-sm"
        size="sm"
      />
      <p class="text-h6 text-grey-7 q-mb-none">Portfolio heat map</p>
    </q-card-section>
    <q-card-section class="q-py-none q-px-none q-px-md-sm">
      <apexchart
        width="375"
        height="400"
        :options="chartData.options"
        :series="chartData.series"
        class="holdings-heat-map"
      ></apexchart>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { getPortfolioHoldingsHeatMapChartOptions } from 'src/service/charts';
import { useNumberFormatter } from 'components/composables/useNumberFormatter';
import { useAppearanceStore } from 'stores/appearance';

export default defineComponent({
  name: 'PortfolioHeatMap',
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    bordered: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const appearanceStore = useAppearanceStore();
    const numberFormatter = useNumberFormatter();

    const chartData = computed(() =>
      getPortfolioHoldingsHeatMapChartOptions(numberFormatter)
    );

    return {
      appearanceStore,
      chartData,
    };
  },
});
</script>
