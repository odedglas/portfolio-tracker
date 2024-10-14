<template>
  <div class="col">
    <div class="row q-px-md items-center">
      <span class="col text-caption" v-for="header in headers" :key="header">
        {{ header }}</span
      >
    </div>
    <q-list class="vesting-periods-list" bordered>
      <q-item
        v-for="(details, index) in vestingPeriodsDetails"
        :key="details.date"
        class="row vesting-row"
      >
        <span class="col flex items-center">#{{ index + 1 }}</span>
        <span class="col flex items-center">{{ details.date }}</span>
        <span class="col flex items-center">{{
          $n(details.amount, 'fixedSensitive')
        }}</span>
        <span class="col flex items-centertext-bold">{{
          $n(details.totalVested, 'fixedSensitive')
        }}</span>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { formatPlanDate } from 'src/service/date';
import { StocksPlan } from 'app/shared/types';
import { buildVestingPeriodsDetails } from 'src/service/stocksPlans';

export default defineComponent({
  name: 'VestingPeriodsList',
  props: {
    plan: {
      type: Object as PropType<StocksPlan>,
      required: true,
    },
  },
  setup(props) {
    const headers = ['#', 'Date', 'Amount', 'Total Vested'];

    const vestingPeriodsDetails = computed(() => {
      const vestingPeriods = buildVestingPeriodsDetails(props.plan);

      if (props.plan.grantDate === props.plan.vestingEndDate) {
        return [
          {
            date: formatPlanDate(props.plan.grantDate),
            amount: props.plan.amount,
            totalVested: props.plan.amount,
          },
        ];
      }

      return vestingPeriods
        .filter((details) => !details.disabled)
        .map((details) => ({
          ...details,
          date: formatPlanDate(details.period),
        }));
    });

    return {
      headers,
      vestingPeriodsDetails,
    };
  },
});
</script>

<style lang="scss">
.vesting-periods-list {
  max-height: 210px;
  min-width: 350px;
  overflow: scroll;

  .vesting-row {
    &:not(:last-child) {
      border-bottom: 1px solid $grey-4;
    }
  }
}
</style>
