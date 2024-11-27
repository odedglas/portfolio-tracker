<template>
  <div
    class="inner q-pa-md flex q-gap-md column justify-between"
    style="min-height: 140px"
  >
    <div class="flex q-gap-md">
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
          {{ $n(Number(tag.value), tag.format ?? 'noneSensitiveDecimal') }}
        </b>
      </q-chip>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TickerLogo from 'components/common/TickerLogo.vue';
import { ViewPortfolioInsight } from 'app/shared/types';
import { daysAgo, isToday } from 'src/service/date';
import { shortHoldingName } from 'src/utils';
import InsightItemText from 'components/dashboard/InsightItemText.vue';

export default defineComponent({
  name: 'InsightItem',
  props: {
    insight: {
      type: Object as PropType<ViewPortfolioInsight>,
      required: true,
    },
  },
  components: {
    InsightItemText,
    TickerLogo,
  },
  setup() {
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

    return {
      getInsightDateBadge,
      shortHoldingName,
    };
  },
});
</script>
