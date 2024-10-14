<template>
  <div class="row items-center justify-between">
    <p class="text-subtitle1 text-bold">
      {{ plan.name }} - {{ plan.identifier }}
    </p>
    <p class="text-caption" v-if="plan.entitlement102Date">
      102 Entitlement Date: {{ formatPlanDate(plan.entitlement102Date) }}
    </p>
  </div>
  <div class="row" v-if="hasVestingPeriodsPlan">
    <vesting-periods-list :plan="plan" />
    <div class="col-3 q-px-md q-pt-sm">
      <apexchart
        chart="radialProgress"
        height="300"
        :options="planVestingPercentChartOptions"
        :series="planVestingPercentChartOptions.series"
      ></apexchart>
    </div>
  </div>
  <div class="flex justify-end q-pa-md q-gutter-md">
    <q-btn
      color="negative"
      v-if="!plan.terminationDate && !isESPP"
      :label="$t('stocks_plans.terminate_plan')"
      @click="terminatePlan"
    />
    <q-btn
      v-if="plan.sellableValue"
      color="primary"
      type="submit"
      label="Execute stocks"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import VueApexCharts from 'vue3-apexcharts';
import { StocksPlan } from 'app/shared/types';
import { formatPlanDate } from 'src/service/date';
import VestingPeriodsList from 'components/stocksPlan/VestingPeriodsList.vue';
import { usePortfolioStore } from 'stores/portfolios';
import { useLoadingStore } from 'stores/loading';

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
    const $q = useQuasar();
    const $t = useI18n().t;

    const { emitLoadingTask } = useLoadingStore();
    const portfolioStore = usePortfolioStore();

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

    const hasVestingPeriodsPlan = computed(() => props.plan.type !== 'espp');

    const terminatePlan = async () => {
      $q.dialog({
        title: 'Terminate Plan',
        message: `Are you sure you wish to terminate the following grant: ${props.plan.identifier}?`,
        ok: {
          label: $t('yes'),
          color: 'primary',
        },
        cancel: {
          label: $t('no'),
          color: 'negative',
        },
      }).onOk(async () => {
        const updatedPlan = { ...props.plan, terminationDate: Date.now() };

        await emitLoadingTask(async () => {
          await portfolioStore.updateStocksPlan(updatedPlan);
        });
      });
    };

    const isESPP = computed(() => props.plan?.type === 'espp');

    return {
      formatPlanDate,
      planVestingPercentChartOptions,
      hasVestingPeriodsPlan,
      terminatePlan,
      isESPP,
    };
  },
});
</script>

<style lang="scss"></style>
