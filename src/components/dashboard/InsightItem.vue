<template>
  <div class="inner q-pa-md flex column q-gap-md">
    <div class="flex justify-between items-center">
      <span class="flex items-center q-gap-sm">
        <ticker-logo
          :ticker="insight.holding.ticker"
          :logo-image="insight.holding.logoImage"
          :size="36"
          class="q-mr-xs"
        />
        <span class="text-h6 text-capitalize">{{
          $t(`insights.types.title.${insight.type}`)
        }}</span>
      </span>
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
import { daysFromNow, isToday } from 'src/service/date';
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
  components: { InsightItemText, TickerLogo },
  setup() {
    const getInsightDateBadge = (insight: ViewPortfolioInsight) => {
      const { createdAt = Date.now(), expiredAt } = insight;

      if (expiredAt) {
        return isToday(expiredAt) ? 'Expired Today' : 'Expired';
      }

      if (isToday(createdAt)) {
        return 'New';
      }

      return `${daysFromNow(createdAt)} days ago`;
    };

    return { getInsightDateBadge, shortHoldingName };
  },
});
</script>
