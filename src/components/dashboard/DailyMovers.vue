<template>
  <q-card flat bordered class="daily-movers q-mt-lg">
    <q-card-section class="flex items-center">
      <q-icon name="timeline" class="text-grey-6 q-mr-sm" size="sm" />
      <p class="text-h6 text-grey-7 q-mb-none">Daily Movers</p>
    </q-card-section>
    <q-card-section>
      <swiper :slides-per-view="6" :vertical="true" :space-between="16">
        <swiper-slide v-for="holding in sortedHoldings" :key="holding.id">
          <div
            class="daily-mover-item q-pa-md flex column items-center text-center"
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
            <span class="text-caption">{{ holding.name }}</span>
            <profit-indicator
              :percentage="holding.dailyChange.percent"
              :value="holding.dailyChange.value"
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
export default defineComponent({
  name: 'DailyMovers',
  components: { ProfitIndicator, TickerLogo, Swiper, SwiperSlide },
  setup() {
    const holdingsStore = useHoldingsStore();

    const sortedHoldings = computed(() =>
      [...holdingsStore.portfolioHoldings].sort(
        (a, b) => b.dailyChange.percent - a.dailyChange.percent
      )
    );

    return {
      holdingsStore,
      sortedHoldings,
    };
  },
});
</script>

<style lang="scss">
.daily-movers {
  .daily-mover-item {
    border: 1px solid $grey-9;
    border-radius: 8px;
    gap: 6px;
    min-height: 70px;
  }
}
</style>
