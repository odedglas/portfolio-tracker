<template>
  <q-card flat bordered class="q-mt-lg">
    <q-card-section class="flex items-center">
      <q-icon
        name="local_fire_department"
        class="text-grey-6 q-mr-sm"
        size="sm"
      />
      <p class="text-h6 text-grey-7 q-mb-none">Portfolio heat map</p>
    </q-card-section>
    <q-card-section class="q-py-none q-px-sm">
      <apexchart
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

export default defineComponent({
  name: 'PortfolioHeatMap',
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const numberFormatter = useNumberFormatter();

    const chartData = computed(() =>
      getPortfolioHoldingsHeatMapChartOptions(numberFormatter)
    );

    return {
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
