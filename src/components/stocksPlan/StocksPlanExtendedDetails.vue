<template>
  <p class="text-subtitle1">{{ plan.name }} - {{ plan.identifier }}</p>

  <div class="row">
    <vesting-periods-list :plan="plan" />
    <div>
      Vesting Graph
      <apexchart
        chart="radialProgress"
        height="350"
        :options="planVestingPercentChartOptions"
        :series="planVestingPercentChartOptions.series"
      ></apexchart>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { StocksPlan } from 'app/shared/types';
import VestingPeriodsList from 'components/stocksPlan/VestingPeriodsList.vue';

export default defineComponent({
  name: 'StocksPlanExtendedDetails',
  components: {
    VestingPeriodsList,
    apexchart: VueApexCharts,
  },
  props: {
    plan: {
      type: Object as PropType<StocksPlan>,
      required: true,
    },
  },
  setup(props) {
    const planVestingPercentChartOptions = computed(() => {
      const vestingPercent = (
        100 *
        ((props.plan?.vested ?? 0) / props.plan.amount)
      ).toFixed(2);

      return {
        chart: {
          height: 350,
          type: 'radialBar',
        },
        series: [vestingPercent],
        labels: ['Vested'],
      };
    });

    return {
      planVestingPercentChartOptions,
    };
  },
});
</script>

<style lang="scss">
.plan-extended-details {
  max-height: 250px;
  overflow: scroll;
}
</style>
