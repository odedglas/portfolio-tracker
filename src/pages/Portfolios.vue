<template>
  <q-page class="row items-center justify-evenly"> Portfolios Page </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Portfolio } from 'src/types';
export default defineComponent({
  name: 'PortfoliosPage',

  setup() {
    const portfolios: Portfolio[] = [
      {
        name: 'My Portfolio',
        currencyCode: 'USD',
        currentValue: 1230,
        totalVested: 1000,
        taxRate: 0.25,
        yearlyTarget: 2000,
      },
    ];

    return { portfolios };
  },
});
</script>
