<template>
  <q-card>
    <q-card-section>
      <q-item>
        <q-item-section avatar>
          <ticker-logo v-bind="plansGroupMeta" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            {{ plansGroupMeta.name }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <stocks-plans-list :plans="plans" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { StocksPlan } from 'app/shared/types';
import TickerLogo from 'components/common/TickerLogo.vue';
import StocksPlansList from 'components/stocksPlan/StocksPlansList.vue';

export default defineComponent({
  name: 'StocksPlansGroupDetails',
  components: { StocksPlansList, TickerLogo },
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

    return {
      plansGroupMeta,
      isVisible,
    };
  },
});
</script>

<style scoped lang="scss"></style>
