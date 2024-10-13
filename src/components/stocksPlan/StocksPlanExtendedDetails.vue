<template>
  <div class="row items-center justify-between">
    <p class="text-subtitle1 text-bold">
      {{ plan.name }} - {{ plan.identifier }}
    </p>
    <p class="text-caption" v-if="plan.entitlement102Date">
      102 Entitlement Date: {{ formatPlanDate(plan.entitlement102Date) }}
    </p>
  </div>
  <div class="row">
    <vesting-periods-list :plan="plan" />
    <div class="col-3 q-pa-md">
      <apexchart
        chart="radialProgress"
        height="300"
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
import { formatPlanDate } from 'src/service/date';
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
          height: 300,
          type: 'radialBar',
        },
        series: [vestingPercent],
        labels: ['Vested'],
      };
    });

    return {
      formatPlanDate,
      planVestingPercentChartOptions,
    };
  },
});
</script>

<style lang="scss"></style>
