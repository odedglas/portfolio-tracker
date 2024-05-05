<template>
  <q-list bordered class="rounded-borders">
    <q-item-label header class="flex justify-end">
      <q-btn flat round dense icon="add" class="q-mr-md text-primary" />
    </q-item-label>

    <q-item v-for="portfolio in portfolios" :key="portfolio.id">
      <portfolio-item :portfolio="portfolio" />
    </q-item>

    <q-separator spaced />
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
  },
});
</script>
