<template>
  <div>
    <p class="text-caption">Vesting periods:</p>

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
        <span class="col flex items-center justify-center">{{
          details.amount
        }}</span>
        <span class="col flex items-center justify-center text-bold">{{
          details.totalVested
        }}</span>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { date as DateAPI } from 'quasar';
import { StocksPlan } from 'app/shared/types';
import { buildVestingPeriodsDetails } from 'stores/stocksPlans';

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
    const formatDate = (date: number) => {
      return DateAPI.formatDate(date, 'DD MMM YY');
    };

    const vestingPeriodsDetails = computed(() => {
      const vestingPeriods = buildVestingPeriodsDetails(props.plan);

      if (props.plan.grantDate === props.plan.vestingEndDate) {
        return [
          {
            date: formatDate(props.plan.grantDate),
            amount: props.plan.amount,
            totalVested: props.plan.amount,
          },
        ];
      }

      return vestingPeriods
        .filter((details) => !details.disabled)
        .map((details) => ({
          ...details,
          date: formatDate(details.period),
        }));
    });

    return {
      headers,
      formatDate,
      vestingPeriodsDetails,
    };
  },
});
</script>

<style lang="scss">
.vesting-periods-list {
  max-height: 250px;
  min-width: 350px;
  overflow: scroll;

  .vesting-row {
    &:not(:last-child) {
      border-bottom: 1px solid $grey-4;
    }
  }
}
</style>
