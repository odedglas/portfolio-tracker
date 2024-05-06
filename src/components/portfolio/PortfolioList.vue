<template>
  <q-list bordered class="rounded-borders q-pa-lg">
    <q-item v-for="(portfolio, index) in portfolios" :key="portfolio.id">
      <portfolio-item
        :portfolio="portfolio"
        @edit-portfolio="editPortfolio"
        @delete-portfolio="deletePortfolio"
      />
      <q-separator spaced v-if="index <= portfolios.length - 1" />
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Portfolio } from 'src/types';
import PortfolioItem from './PortfolioItem.vue';

export default defineComponent({
  name: 'PortfolioList',
  components: {
    PortfolioItem,
  },
  props: {
    portfolios: {
      type: Array as PropType<Portfolio[]>,
      required: true,
    },
    editPortfolio: {
      type: Function as PropType<(portfolio: Portfolio) => void>,
      required: false,
    },
    deletePortfolio: {
      type: Function as PropType<(portfolio: Portfolio) => void>,
      required: false,
    },
  },
});
</script>
