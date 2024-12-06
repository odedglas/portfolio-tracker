<template>
  <q-card
    flat
    v-if="insights.length > 0"
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
        :space-between="16"
      >
        <swiper-slide
          v-for="(insight, insightKey) in insights"
          :key="insightKey"
          class="insight-content"
        >
          <insight-item :insight="insight" />
        </swiper-slide>
      </swiper>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useQuasar } from 'quasar';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import { useAppearanceStore } from 'stores/appearance';
import { useInsightsStore } from 'stores/insights';
import { shortHoldingName } from 'src/utils';
import InsightItem from 'components/dashboard/InsightItem.vue';

import 'swiper/css';
import 'swiper/css/pagination';

export default defineComponent({
  name: 'PortfolioInsights',
  components: { InsightItem, Swiper, SwiperSlide },
  setup() {
    const $q = useQuasar();
    const insightsStore = useInsightsStore();
    const appearanceStore = useAppearanceStore();

    const inactiveInsights = computed(() =>
      [...insightsStore.inactiveInsights].map((insight) => ({
        ...insight,
        inactive: true,
      }))
    );

    const insights = computed(() => [
      ...insightsStore.dailyInsights,
      ...inactiveInsights.value,
    ]);

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
    position: relative;
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
