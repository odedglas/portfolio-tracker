<template>
  <div
    :class="[
      'inner',
      { 'q-pt-md q-pb-sm': !compact, 'q-pa-sm': compact },
      'flex q-gap-md column justify-between',
    ]"
    @mouseenter="closeMenuOpen = true"
    @mouseleave="closeMenuOpen = false"
  >
    <div
      v-if="insight.expiredAt"
      :class="`floating-close-menu ${closeMenuOpen ? 'open' : 'closed'}`"
      @click="removeInsight"
    >
      <q-icon name="close" color="red-5" size="xs">
        <q-tooltip>Hide insight</q-tooltip>
      </q-icon>
    </div>
    <div class="flex q-gap-md" :class="{ 'q-px-md': !compact }">
      <div class="flex justify-between items-center full-width">
        <div class="flex items-center q-gap-sm">
          <ticker-logo
            :ticker="insight.holding.ticker"
            :logo-image="insight.holding.logoImage"
            :size="compact ? 24 : 36"
            class="q-mr-xs"
          />
          <span :class="compact ? 'text-subtitle1' : 'text-h6'">{{
            $t(`insights.types.title.${insight.type}`)
          }}</span>
        </div>
        <q-chip
          class="text-caption text-grey-8"
          :label="getInsightDateBadge(insight).text"
          v-if="$q.platform.is.desktop"
          dense
          outline
          square
          color="orange"
        >
          <q-tooltip v-if="getInsightDateBadge(insight).tooltip">
            {{ getInsightDateBadge(insight).tooltip }}
          </q-tooltip>
        </q-chip>
      </div>
      <span class="insight-text">
        <insight-item-text :insight="insight" />
      </span>
    </div>
    <div class="flex justify-between">
      <i class="text-subtitle2 text-grey-8 q-px-md flex items-center">
        <q-icon name="schedule" class="q-mr-xs" />
        Created at {{ formatNotificationDate(insight.createdAt ?? 0) }} | Price:
        {{ $n(getInsightsTriggerPrice(), 'noneSensitiveDecimal') }}
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
    <div class="flex chips-container q-px-none q-px-md-md q-pb-xs">
      <q-chip
        v-for="(tag, tagIndex) in insight?.tags"
        :size="$q.platform.is.mobile ? 'xs' : 'sm'"
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
import { useQuasar } from 'quasar';

const MIN_GRAPH_INPUTS = 3;

export default defineComponent({
  name: 'InsightItem',
  props: {
    insight: {
      type: Object as PropType<ViewPortfolioInsight>,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    InsightMenu,
    InsightItemText,
    TickerLogo,
  },
  setup(props) {
    const $q = useQuasar();
    const closeMenuOpen = ref(false);
    const insightMenuOpen = ref(false);

    const insightsStore = useInsightsStore();
    const { showAreYouSure } = useAreYouSure();

    const showInsightHistoryGraph = computed(
      () =>
        (props.insight?.historyInputs?.length ?? 0) >= MIN_GRAPH_INPUTS &&
        $q.platform.is.desktop
    );

    const getInsightDateBadge = (insight: ViewPortfolioInsight) => {
      const { createdAt = Date.now(), expiredAt } = insight;

      if (expiredAt) {
        return {
          text: `Expired ${daysAgo(expiredAt)}`,
          tooltip: `Expired at ${formatNotificationDate(expiredAt)}`,
        };
      }

      if (isToday(createdAt)) {
        return {
          text: 'New',
          tooltip: 'Insight created today',
        };
      }

      return {
        text: daysAgo(createdAt),
      };
    };

    const removeInsight = () => {
      showAreYouSure({
        title: 'Delete insight',
        message: `Are you sure you want to delete this insight for "${props.insight.holding.ticker}"?`,
        callback: () => insightsStore.removeInsight(props.insight.id),
      });
    };

    const getInsightsTriggerPrice = () => {
      const { inputs, historyInputs } = props.insight;
      const [firstHistoryInput] = historyInputs ?? [];

      return (
        firstHistoryInput?.inputs?.regularMarketPrice ??
        inputs.regularMarketPrice ??
        0
      );
    };

    return {
      closeMenuOpen,
      insightMenuOpen,
      showInsightHistoryGraph,
      getInsightDateBadge,
      shortHoldingName,
      formatNotificationDate,
      removeInsight,
      getInsightsTriggerPrice,
    };
  },
});
</script>

<style lang="scss">
.insight-text {
  min-height: 42px;
}

.floating-close-menu {
  position: absolute;
  transition: all 0.2s;
  right: 4px;
  top: 10px;
  cursor: pointer;
  z-index: 9999;

  &.closed {
    top: -20px;
    opacity: 0;
    pointer-events: none;
  }

  &.open {
    top: 5px;
    opacity: 1;
    pointer-events: all;
  }
}
</style>
