<template>
  <q-card flat bordered class="q-mt-lg">
    <q-card-section class="flex items-center">
      <q-icon
        name="local_fire_department"
        class="text-grey-6 q-mr-sm"
        size="sm"
      />
      <p class="text-h6 text-grey-7 q-mb-none">Portfolio Heat Map</p>
    </q-card-section>
    <q-card-section class="q-py-none q-px-sm">
      <apexchart
        height="400"
        :options="options"
        :series="series"
        class="holdings-heat-map"
      ></apexchart>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useHoldingsStore } from 'stores/holdings';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'PortfolioHeatMap',
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const $n = useI18n().n;
    const holdingsStore = useHoldingsStore();

    const series = computed(() => {
      const res = [
        {
          data: holdingsStore.portfolioHoldings.map((holding) => {
            const normalizedProfitPercent =
              holding.profit.percent *
              (holding.profit.value >= 0 ? 1 : -1) *
              100;

            return {
              x: holding.ticker,
              y: $n(normalizedProfitPercent, 'fixed'),
            };
          }),
        },
      ];

      console.log(res);

      return res;
    });

    return {
      series,
      options: {
        legend: {
          show: false,
        },
        chart: {
          type: 'treemap',
          height: 400,
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px',
            fontFamily: 'inherit',
          },
          formatter: function (text: string, op: { value: string }) {
            return [text, `${op.value}%`];
          },
          offsetY: -4,
        },
        plotOptions: {
          treemap: {
            enableShades: false,
            colorScale: {
              ranges: [
                {
                  from: -50,
                  to: 0,
                  color: '#CD363A',
                },
                {
                  from: 0.001,
                  to: 100,
                  color: '#52B12C',
                },
              ],
            },
          },
        },
        tooltip: {
          x: {
            show: true,
            formatter: (dataIndex: number) => {
              const holding = holdingsStore.portfolioHoldings[dataIndex];
              return holding?.name ?? '';
            },
          },
          y: {
            formatter: (value: number) => {
              return `${value}%`;
            },
            title: {
              formatter: (seriesName: string) => seriesName,
            },
          },
        },
      },
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
