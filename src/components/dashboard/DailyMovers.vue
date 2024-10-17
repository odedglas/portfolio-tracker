<template>
  <q-card flat bordered class="daily-movers q-mt-lg">
    <q-card-section class="flex items-center">
      <q-icon name="timeline" class="text-grey-6 q-mr-sm" size="sm" />
      <p class="text-h6 text-grey-7 q-mb-none">Daily Movers</p>
    </q-card-section>
    <q-card-section class="q-py-sm">
      <p class="text-caption text-grey-8 q-mb-sm">Portfolio:</p>
      <daily-movers-swiper :movers="viewHoldings" />
    </q-card-section>
    <q-card-section class="q-py-sm">
      <p class="text-caption text-grey-8 q-mb-sm">Benchmarks:</p>
      <daily-movers-swiper :movers="benchmarks" :show-logo="false" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { useHoldingsStore } from 'stores/holdings';
import DailyMoversSwiper from 'components/dashboard/DailyMoversSwiper.vue';
import { useQuotesStore } from 'stores/quotes';

import 'swiper/css';
import { dailyMoversBenchmarks } from './constants';
import { getQuotes } from 'src/service/stocks';

const benchmarkDefaults = dailyMoversBenchmarks.map((opt) => ({
  ...opt,
  lastPrice: 0,
  dailyChangePercent: 0,
}));

export default defineComponent({
  name: 'DailyMovers',
  components: { DailyMoversSwiper },
  setup() {
    const benchmarks = ref(benchmarkDefaults);
    const holdingsStore = useHoldingsStore();
    const quotes = useQuotesStore();

    const viewHoldings = computed(() =>
      [...holdingsStore.portfolioHoldings]
        .map((holding) => ({
          ...holding,
          dailyChangePercent: holding.dailyChange.percent,
          lastPrice:
            quotes.tickerQuotes[holding.ticker]?.regularMarketPrice ?? 0,
        }))
        .sort((a, b) => b.dailyChange.percent - a.dailyChange.percent)
    );

    onMounted(async () => {
      const { quoteResponse } = await getQuotes(
        benchmarks.value.map((b) => b.ticker)
      );

      benchmarks.value = benchmarks.value.map((b) => {
        const matchingQuote = quoteResponse.result.find(
          (quote) => quote.symbol === b.ticker
        );

        return {
          ...b,
          lastPrice: matchingQuote?.regularMarketPrice ?? 0,
          dailyChangePercent:
            (matchingQuote?.regularMarketChangePercent ?? 0) / 100,
        };
      });
    });

    return {
      holdingsStore,
      viewHoldings,
      benchmarks,
    };
  },
});
</script>

<style lang="scss">
.daily-movers {
  .daily-item-wrapper {
    .daily-mover-item {
      border: 1px solid $grey-9;
      border-radius: 8px;
      padding: 8px 8px 4px;
      gap: 4px;

      .q-icon {
        font-size: 20px !important;
      }
    }
  }
}
</style>
