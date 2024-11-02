<template>
  <swiper
    :slides-per-view="$q.platform.is.desktop ? 9 : 3"
    :vertical="true"
    :free-mode="true"
    @touchstart="(e:Event) => e.stopImmediatePropagation()"
    @touchend="(e:Event) => e.stopImmediatePropagation()"
    :space-between="16"
  >
    <swiper-slide
      v-for="(mover, index) in movers"
      :key="index"
      class="daily-item-wrapper"
    >
      <div
        class="daily-mover-item q-pb-none flex column items-center text-center"
      >
        <span class="flex items-center">
          <ticker-logo
            v-if="showLogo"
            :ticker="mover.ticker"
            :logo-image="mover.logoImage"
            class="q-mr-xs"
            :size="20"
          />
          <span class="text-caption text-bold text-grey-9">{{
            showLogo ? mover.ticker : mover.label
          }}</span>
        </span>
        <span class="text-caption text-grey-9 q-mt-xs">
          {{ $n(mover.lastPrice, 'noneSensitiveDecimal') }}
        </span>
        <profit-indicator
          class="text-caption text-bold"
          :percentage="mover.dailyChangePercent"
          :display-as-row="false"
        />
      </div>
    </swiper-slide>
  </swiper>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import TickerLogo from 'components/common/TickerLogo.vue';
import 'swiper/css';
import ProfitIndicator from 'components/common/ProfitIndicator.vue';

export default defineComponent({
  name: 'DailyMoversSwiper',
  components: { ProfitIndicator, TickerLogo, Swiper, SwiperSlide },
  props: {
    movers: {
      required: true,
      type: Array as PropType<
        {
          id?: string;
          ticker: string;
          label?: string;
          logoImage?: string;
          lastPrice: number;
          dailyChangePercent: number;
        }[]
      >,
    },
    showLogo: {
      default: true,
      type: Boolean,
    },
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
