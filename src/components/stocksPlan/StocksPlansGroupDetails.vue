<template>
  <q-card>
    <q-card-section>
      <stocks-plans-group-header :plans="plans" />
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
import { defineComponent, PropType, ref } from 'vue';
import { StocksPlan } from 'app/shared/types';
import StocksPlansList from 'components/stocksPlan/StocksPlansList.vue';
import StocksPlansGroupHeader from 'components/stocksPlan/StocksPlansGroupHeader.vue';

export default defineComponent({
  name: 'StocksPlansGroupDetails',
  components: { StocksPlansGroupHeader, StocksPlansList },
  emits: ['delete-plan', 'edit-plan'],
  props: {
    plans: {
      type: Object as PropType<StocksPlan[]>,
      required: true,
    },
  },
  setup() {
    const isVisible = ref(false);

    return {
      isVisible,
    };
  },
});
</script>

<style scoped lang="scss"></style>
