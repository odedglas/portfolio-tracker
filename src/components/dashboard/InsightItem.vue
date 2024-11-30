<template>
  <div
    class="inner q-pt-md q-pb-sm flex q-gap-md column justify-between"
    @mouseenter="closeMenuOpen = true"
    @mouseleave="closeMenuOpen = false"
  >
    <div
      v-if="insight.expiredAt"
      :class="`floating-close-menu ${closeMenuOpen ? 'open' : 'closed'}`"
      @click="removeInsight"
    >
      <q-icon name="close" color="grey-9" size="xs">
        <q-tooltip>Hide insight</q-tooltip>
      </q-icon>
    </div>
    <div class="flex q-gap-md q-px-md">
      <div class="flex justify-between items-center full-width">
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
        <q-chip
          class="text-caption text-grey-8"
          :label="getInsightDateBadge(insight)"
          dense
          outline
          square
          color="orange"
        />
      </div>
      <insight-item-text :insight="insight" />
    </div>
    <div class="flex justify-between">
      <i class="text-subtitle2 text-grey-8 q-px-md flex items-center">
        <q-icon name="schedule" class="q-mr-xs" />
        Created at {{ formatNotificationDate(insight.createdAt ?? 0) }} | Price:
        {{ $n(insight.inputs.regularMarketPrice ?? 0, 'noneSensitiveDecimal') }}
      </i>
      <span class="q-px-md cursor-pointer" v-if="showInsightHistoryGraph">
        <q-icon
          name="timeline"
          size="sm"
          color="grey-7"
          @click="insightMenuOpen = !insightMenuOpen"
        >
          <insight-menu
            :show="insightMenuOpen"
            :insight="insight"
            @close="insightMenuOpen = false"
          />
        </q-icon>
      </span>
    </div>
    <q-separator />
    <div class="flex chips-container q-px-md q-pb-xs">
      <q-chip
        v-for="(tag, tagIndex) in insight?.tags"
        size="sm"
        outline
        class="text-weight-bold"
        color="primary"
        :key="tagIndex"
      >
        {{ $t(`insights.tags.${tag.name}`) }}:&nbsp;
        {{ $n(Number(tag.value), tag.format ?? 'noneSensitiveDecimal') }}
      </q-chip>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import TickerLogo from 'components/common/TickerLogo.vue';
import { ViewPortfolioInsight } from 'app/shared/types';
import { daysAgo, formatNotificationDate, isToday } from 'src/service/date';
import { shortHoldingName } from 'src/utils';
import InsightItemText from 'components/dashboard/InsightItemText.vue';
import { useInsightsStore } from 'stores/insights';
import { useAreYouSure } from 'components/composables/useAreYouSureDialog';
import InsightMenu from 'components/dashboard/InsightMenu.vue';

const MIN_GRAPH_INPUTS = 0;

export default defineComponent({
  name: 'InsightItem',
  props: {
    insight: {
      type: Object as PropType<ViewPortfolioInsight>,
      required: true,
    },
  },
  components: {
    InsightMenu,
    InsightItemText,
    TickerLogo,
  },
  setup(props) {
    const closeMenuOpen = ref(false);
    const insightMenuOpen = ref(false);

    const insightsStore = useInsightsStore();
    const { showAreYouSure } = useAreYouSure();

    const showInsightHistoryGraph = computed(
      () => (props.insight?.historyInputs?.length ?? 0) >= MIN_GRAPH_INPUTS
    );

    const getInsightDateBadge = (insight: ViewPortfolioInsight) => {
      const { createdAt = Date.now(), expiredAt, inactive } = insight;

      if (expiredAt) {
        return `Expired ${daysAgo(expiredAt)}`;
      }

      if (inactive) {
        return 'Expired Today';
      }

      if (isToday(createdAt)) {
        return 'New';
      }

      return daysAgo(createdAt);
    };

    const removeInsight = () => {
      showAreYouSure({
        title: 'Delete insight',
        message: `Are you sure you want to delete this insight for "${props.insight.holding.ticker}"?`,
        callback: () => insightsStore.removeInsight(props.insight.id),
      });
    };

    return {
      closeMenuOpen,
      insightMenuOpen,
      showInsightHistoryGraph,
      getInsightDateBadge,
      shortHoldingName,
      formatNotificationDate,
      removeInsight,
    };
  },
});
</script>

<style lang="scss">
.floating-close-menu {
  position: absolute;
  transition: all 0.2s;
  right: 8px;
  cursor: pointer;
  z-index: 9999;

  &.closed {
    bottom: 0;
    opacity: 0;
    pointer-events: none;
  }

  &.open {
    bottom: 20px;
    opacity: 1;
    pointer-events: all;
  }
}
</style>
