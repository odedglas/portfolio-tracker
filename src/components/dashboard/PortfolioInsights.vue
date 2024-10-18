<template>
  <q-card flat bordered class="portfolio-insights q-mt-lg">
    <q-card-section class="flex items-center">
      <q-icon name="auto_awesome" class="text-grey-6 q-mr-sm" size="sm" />
      <p class="text-h6 text-grey-7 q-mb-none">{{ $t('insights.title') }}</p>
    </q-card-section>
    <q-card-section class="q-py-sm row">
      <div
        v-for="insight in insights"
        :key="insight.title"
        class="col-4 q-pa-sm insight-content"
      >
        <div class="inner q-pa-lg flex column q-gap-md">
          <div class="flex items-center q-gap-sm">
            <ticker-logo
              :ticker="insight.holding.ticker"
              :logo-image="insight.holding.logoImage"
              :size="36"
              class="q-mr-xs"
            />
            <span class="flex column">
              <span class="text-caption text-grey-8">{{ insight.holding.name }} <b>is</b></span>
              <span class="text-h6 text-capitalize">{{
                  $t(`insights.types.${insight.type}`)
                }}</span>
            </span>
          </div>
          {{ insight.title }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useHoldingsStore } from 'stores/holdings';
import TickerLogo from 'components/common/TickerLogo.vue';

export default defineComponent({
  name: 'PortfolioInsights',
  components: { TickerLogo },
  setup() {
    const holdingsStore = useHoldingsStore();

    const insights = computed(() => {
      console.log(holdingsStore.insights);

      return holdingsStore.insights;
    });

    return {
      insights,
    };
  },
});
</script>

<style lang="scss">
.insight-content {
  .inner {
    min-height: 150px;
    border: 1px solid $grey-5;
  }
}
</style>
