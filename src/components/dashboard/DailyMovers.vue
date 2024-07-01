<template>
  <q-card flat bordered class="daily-movers q-mt-lg">
    <q-card-section class="flex items-center">
      <q-icon name="timeline" class="text-grey-6 q-mr-sm" size="sm" />
      <p class="text-h6 text-grey-7 q-mb-none">Daily Movers</p>
    </q-card-section>
    <q-card-section>
      <swiper :slides-per-view="9" :vertical="true" :space-between="16">
        <swiper-slide
          v-for="holding in sortedHoldings"
          :key="holding.id"
          class="daily-item-wrapper"
        >
          <div
            class="daily-mover-item q-pb-none flex column items-center text-center"
          >
            <span class="flex items-center">
              <ticker-logo
                :ticker="holding.ticker"
                :logo-image="holding.logoImage"
                class="q-mr-xs"
                :size="20"
              />
              <span class="text-caption text-bold text-grey-9">{{
                holding.ticker
              }}</span>
            </span>
            <span class="text-caption text-grey-9 q-mt-xs">
              {{ $n(getTickerLastPrice(holding), 'decimal') }}
            </span>
            <profit-indicator
              class="text-caption text-bold"
              :percentage="holding.dailyChange.percent"
              :display-as-row="false"
            />
          </div>
        </swiper-slide>
      </swiper>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useHoldingsStore } from 'stores/holdings';
import TickerLogo from 'components/common/TickerLogo.vue';
import 'swiper/css';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';
import { useQuotesStore } from 'stores/quotes';
import { Holding } from 'app/shared/types';
export default defineComponent({
  name: 'DailyMovers',
  components: { ProfitIndicator, TickerLogo, Swiper, SwiperSlide },
  setup() {
    const holdingsStore = useHoldingsStore();
    const quotes = useQuotesStore();

    const sortedHoldings = computed(() =>
      [...holdingsStore.portfolioHoldings].sort(
        (a, b) => b.dailyChange.percent - a.dailyChange.percent
      )
    );

    const getTickerLastPrice = (holding: Holding) =>
      quotes.tickerQuotes[holding.ticker]?.regularMarketPrice ?? 0;

    return {
      holdingsStore,
      sortedHoldings,
      getTickerLastPrice,
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
