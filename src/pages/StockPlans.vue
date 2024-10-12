<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column stocks-plan-wrapper">
      <p class="text-h5 q-mt-md q-mb-lg text-grey-7 dashboard-title">
        {{ $t('stocks_plans.title') }}
      </p>

      <div class="plans-wrapper flex column" v-if="stocksPlansGroups">
        <stocks-plans-group-details
          v-for="(plans, index) in stocksPlansGroups"
          :key="index"
          :plans="plans"
        />
      </div>

      <div v-else class="q-pa-lg">
        <p class="text-body1">No stocks plans were found...</p>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import groupBy from 'lodash/groupBy';
import { useStocksPlansStore } from 'stores/stocksPlans';
import StocksPlansGroupDetails from 'components/stocksPlan/StocksPlansGroupDetails.vue';

export default defineComponent({
  name: 'StocksPlans',
  components: { StocksPlansGroupDetails },
  setup() {
    const stocksPlansStore = useStocksPlansStore();

    const stocksPlansGroups = computed(() =>
      groupBy(stocksPlansStore.stocksPlans, 'ticker')
    );

    return {
      stocksPlansGroups,
    };
  },
});
</script>

<style lang="scss">
.plans-wrapper {
  gap: 24px;
}
</style>
