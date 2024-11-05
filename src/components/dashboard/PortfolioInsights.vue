<template>
  <q-card
    flat
    :bordered="appearanceStore.borderedCards"
    class="portfolio-insights q-mt-lg q-pb-none q-pb-md-md"
  >
    <q-card-section class="flex items-center q-pa-sm q-pa-md-lg">
      <q-icon name="auto_awesome" class="dashboard-icon q-mr-sm" size="sm" />
      <p class="text-h6 text-grey-7 q-mb-none">{{ $t('insights.title') }}</p>
    </q-card-section>
    <q-card-section class="q-py-sm row">
      <swiper
        :pagination="
          hasPagination
            ? {
                dynamicBullets: $q.platform.is.desktop,
                clickable: true,
              }
            : false
        "
        :modules="swiperModules"
        :slides-per-view="hasPagination ? insightsPerPage : insights.length"
        :vertical="true"
        class="insights-swiper-wrapper"
        wrapper-class="q-pb-xl"
        @touchstart="(e:Event) => e.stopImmediatePropagation()"
        @touchend="(e:Event) => e.stopImmediatePropagation()"
        :space-between="16"
      >
        <swiper-slide
          v-for="(insight, insightKey) in insights"
          :key="insightKey"
          class="insight-content"
        >
          <div class="inner q-pa-md flex column q-gap-md">
            <div class="flex items-center q-gap-sm">
              <ticker-logo
                :ticker="insight.holding.ticker"
                :logo-image="insight.holding.logoImage"
                :size="36"
                class="q-mr-xs"
              />
              <span class="text-h6 text-capitalize">{{
                $t(`insights.types.title.${insight.type}`)
              }}</span>
            </div>
            <p
              class="q-mb-sm"
              v-html="
                $t(`insights.types.description.${insight.type}`, {
                  ...insight.inputs,
                  name: shortHoldingName(insight.holding.name),
                  movingAverageDays: insight.inputs.movingAverageDays,
                  deltaPercent:
                    typeof insight.inputs.deltaPercent === 'number'
                      ? $n(insight.inputs.deltaPercent, 'percent')
                      : 0,
                  direction: insight.inputs.isAbove ? 'above' : 'below',
                })
              "
            />
            <div class="flex chips-container">
              <q-chip
                v-for="(tag, tagIndex) in insight?.tags"
                size="sm"
                outline
                color="primary"
                :key="tagIndex"
              >
                {{ $t(`insights.tags.${tag.name}`) }}:&nbsp;
                <b>
                  {{
                    $n(Number(tag.value), tag.format ?? 'noneSensitiveDecimal')
                  }}
                </b>
              </q-chip>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import { useHoldingsStore } from 'stores/holdings';
import TickerLogo from 'components/common/TickerLogo.vue';
import { shortHoldingName } from 'src/utils';

import 'swiper/css';
import 'swiper/css/pagination';
import { useQuasar } from 'quasar';
import { useAppearanceStore } from 'stores/appearance';

export default defineComponent({
  name: 'PortfolioInsights',
  components: { Swiper, SwiperSlide, TickerLogo },
  setup() {
    const $q = useQuasar();
    const holdingsStore = useHoldingsStore();
    const appearanceStore = useAppearanceStore();

    const insights = computed(() => holdingsStore.insights);

    const insightsPerPage = computed(() => ($q.platform.is.desktop ? 3 : 1));

    const hasPagination = computed(
      () => insights.value.length >= insightsPerPage.value
    );

    return {
      insights,
      hasPagination,
      insightsPerPage,
      swiperModules: [Pagination],
      appearanceStore,
      shortHoldingName,
    };
  },
});
</script>

<style lang="scss">
.insight-content {
  .inner {
    border: 1px solid $grey-5;
  }

  .chips-container {
    .q-chip {
      height: fit-content;
    }
  }
}

.insights-swiper-wrapper {
  .swiper-pagination-bullet-active {
    background: $primary;
  }
}
</style>
