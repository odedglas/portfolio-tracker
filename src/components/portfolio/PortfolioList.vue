<template>
  <q-list bordered class="rounded-borders bg-white">
    <portfolio-item
      v-for="(portfolio, index) in portfolios"
      :key="portfolio.id"
      :portfolio="portfolio"
      :withSpacer="index < portfolios.length - 1"
      @edit-portfolio="editPortfolio"
      @delete-portfolio="deletePortfolio"
    />
  </q-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Portfolio } from 'app/shared/types';
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
