<template>
  <div class="flex column q-gap-lg">
    <p class="text-h6 text-grey-8 q-px-md q-my-none text-weight-regular">
      {{ $t('stocks_plans.title') }}
    </p>

    <div
      class="plans-wrapper flex column"
      style="gap: 24px"
      v-if="Object.keys(stocksPlansGroups).length"
    >
      <mobile-abstract-list
        v-for="(plans, index) in stocksPlansGroups"
        :key="index"
        :title="plans[0].name"
        :items="buildPlansGroupListItems(plans)"
      />
    </div>
    <div v-else>
      <p class="text-body1">
        {{ $t('stocks_plans.empty_plans') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStocksPlansStore } from 'stores/stocksPlans';
import groupBy from 'lodash/groupBy';
import MobileAbstractList from 'src/mobile/MobileAbstractList.vue';
import { StocksPlan } from 'app/shared/types';

export default defineComponent({
  name: 'MobileStockPlans',
  components: { MobileAbstractList },
  setup() {
    const stocksPlansStore = useStocksPlansStore();

    const stocksPlansGroups = computed(() =>
      groupBy(stocksPlansStore.stocksPlans, 'ticker')
    );

    const buildPlansGroupListItems = (plans: StocksPlan[]) =>
      plans.map((plan) => ({
        title: `Plan ${plan.identifier}`,
        subtitle: `${plan.vested} vested shares`,
        value: plan.potentialValue ?? 0,
        caption: `${plan.availableShares} shares | $${plan.grantPrice}`,
        date: plan.grantDate,
        ticker: {
          symbol: plan.ticker,
          logoImage: plan.logoImage,
        },
      }));

    return {
      stocksPlansStore,
      stocksPlansGroups,
      buildPlansGroupListItems,
    };
  },
});
</script>
