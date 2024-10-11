<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column stocks-plan-wrapper">
      <p class="text-h5 q-mb-none text-grey-7 dashboard-title">
        {{ $t('stocks_plans.title') }}
      </p>

      Body....
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { stocksClient } from 'app/shared/api';

export default defineComponent({
  name: 'StocksPlans',
  components: {},
  setup() {
    onMounted(async () => {
      const res = await stocksClient.getFearAndGreedIndex();

      console.log(res.data);
    });
    return {};
  },
});
</script>

<style lang="scss"></style>
