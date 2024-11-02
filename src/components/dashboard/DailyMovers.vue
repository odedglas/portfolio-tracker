<template>
  <q-card
    flat
    :bordered="appearanceStore.borderedCards"
    class="daily-movers q-mt-lg q-pb-none q-pb-md-md"
  >
    <q-card-section class="flex justify-between q-pa-sm q-pa-md-lg">
      <div class="flex items-center">
        <q-icon name="timeline" class="dashboard-icon q-mr-sm" size="sm" />
        <p class="text-h6 text-grey-7 q-mb-none">Daily Movers</p>
      </div>
      <q-chip
        outline
        size="md"
        color="primary"
        :icon="featAndGreed.emoji"
        class="q-mt-md q-mt-md-none"
        >Fear and Greed Index: {{ featAndGreed.text }} /
        {{ featAndGreed.value }}</q-chip
      >
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

import { dailyMoversBenchmarks } from './constants';
import { getQuotes } from 'src/service/stocks';
import { useAppearanceStore } from 'stores/appearance';

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
    const quotesStore = useQuotesStore();
    const appearanceStore = useAppearanceStore();

    const viewHoldings = computed(() =>
      [...holdingsStore.portfolioHoldings]
        .map((holding) => ({
          ...holding,
          dailyChangePercent: holding.dailyChange.percent,
          lastPrice:
            quotesStore.tickerQuotes[holding.ticker]?.regularMarketPrice ?? 0,
        }))
        .sort((a, b) => b.dailyChange.percent - a.dailyChange.percent)
    );

    const featAndGreed = computed(() => {
      const { value = 0, valueText } = quotesStore.fearAndGreed?.now ?? {};

      const emoji =
        value < 35
          ? 'sentiment_dissatisfied'
          : value > 65
          ? 'sentiment_very_satisfied'
          : 'sentiment_neutral';

      return { value, text: valueText, emoji };
    });

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
      quotesStore,
      appearanceStore,
      featAndGreed,
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
