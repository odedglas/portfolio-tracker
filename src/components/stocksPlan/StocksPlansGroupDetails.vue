<template>
  <q-card>
    <q-card-section>
      <q-item>
        <q-item-section avatar>
          <ticker-logo v-bind="plansGroupMeta" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h5">
            {{ plansGroupMeta.name }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label class="text-subtitle1 text-black">
            Plans value: {{ $n(plansTotal.total, 'currency') }}
          </q-item-label>
        </q-item-section>
        <q-separator vertical class="q-mx-md" />
        <profit-indicator
          :value="plansTotal.profit"
          show-value-sign
          :percentage="profitPercent"
        />
      </q-item>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <stocks-plans-list
        :plans="plans"
        @delete-plan="(plan) => $emit('delete-plan', plan)"
        @edit-plan="(plan) => $emit('edit-plan', plan)"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { StocksPlan } from 'app/shared/types';
import TickerLogo from 'components/common/TickerLogo.vue';
import StocksPlansList from 'components/stocksPlan/StocksPlansList.vue';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';

export default defineComponent({
  name: 'StocksPlansGroupDetails',
  components: { ProfitIndicator, StocksPlansList, TickerLogo },
  emits: ['delete-plan', 'edit-plan'],
  props: {
    plans: {
      type: Object as PropType<StocksPlan[]>,
      required: true,
    },
  },
  setup(props) {
    const isVisible = ref(false);

    const plansGroupMeta = computed(() => {
      const [firstPlan] = props.plans;
      const { name, ticker, logoImage } = firstPlan;

      return {
        name,
        ticker,
        logoImage,
      };
    });

    const plansTotal = computed(() =>
      props.plans.reduce(
        (acc, plan) => {
          const {
            grantPrice = 0,
            availableShares = 0,
            potentialValue = 0,
          } = plan;

          const profit = potentialValue - grantPrice * availableShares;

          return {
            total: acc.total + potentialValue,
            profit: acc.profit + profit,
            sellable: acc.sellable + potentialValue,
          };
        },
        { total: 0, sellable: 0, profit: 0 }
      )
    );

    const profitPercent = computed(() => {
      return plansTotal.value.profit / plansTotal.value.total;
    });

    return {
      plansGroupMeta,
      isVisible,
      plansTotal,
      profitPercent,
    };
  },
});
</script>

<style scoped lang="scss"></style>
