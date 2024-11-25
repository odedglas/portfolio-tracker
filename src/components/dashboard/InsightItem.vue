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
    <apexchart
      width="100%"
      height="35"
      :options="chartOptions"
      :series="series"
    ></apexchart>
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
import VueApexCharts from 'vue3-apexcharts';
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
  components: {
    InsightItemText,
    TickerLogo,
    apexchart: VueApexCharts,
  },
  setup() {
    const daysAgo = (date: number) => {
      const daysPlural = daysFromNow(date) > 1 ? 's' : '';

      return `${daysFromNow(date)} day${daysPlural} ago`;
    };

    const getInsightDateBadge = (insight: ViewPortfolioInsight) => {
      const { createdAt = Date.now(), expiredAt } = insight;

      if (expiredAt) {
        return isToday(expiredAt)
          ? 'Expired Today'
          : `Expired ${daysAgo(expiredAt)}`;
      }

      if (isToday(createdAt)) {
        return 'New';
      }

      return daysAgo(createdAt);
    };

    return {
      getInsightDateBadge,
      shortHoldingName,
      series: [
        {
          data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14],
        },
      ],
      chartOptions: {
        chart: {
          type: 'line',
          width: '100%',
          height: 35,
          sparkline: {
            enabled: true,
          },
        },
        colors: ['#a21c48'],
        stroke: {
          width: 2,
        },
        tooltip: {
          x: {
            show: false,
          },
          y: {
            title: {
              formatter: (s: string) => s,
            },
          },
          marker: {
            show: false,
          },
        },
      },
    };
  },
});
</script>
