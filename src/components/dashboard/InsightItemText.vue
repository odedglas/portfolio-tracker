<template>
  <span v-if="insight.type === 'near200DaysMovingAverages' || insight.type === 'near50DaysMovingAverages'">
    {{ inputs.name }} is <b>{{ inputs.deltaPercent }}</b>
    <b>{{ inputs.direction }}</b> it's
    <b>{{ inputs.movingAverageDays }}</b> day's moving average.
  </span>
  <span v-if="insight.type === 'highShortInterest'">
    {{ inputs.name }} short interest is <b>{{ inputs.shortRatio }}</b> which is
    <b>{{ inputs.deltaPercent }}</b> above expected.
  </span>
  <span v-if="insight.type === 'near52WeekLow'">
    {name} is near its 52 week low.
    {{ inputs.name }} is near it's 52 weeks low.
  </span>
  <span v-if="insight.type === 'below52WeekHigh'">
    {{ inputs.name }} is <b>{{ inputs.deltaPercent }}</b>
    <b>{{ inputs.direction }}</b> it's 52-week-high and is <b>above</b> it's
    moving averages.
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { ViewPortfolioInsight } from 'app/shared/types';
import { shortHoldingName } from 'src/utils';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'InsightItemText',
  props: {
    insight: {
      type: Object as PropType<ViewPortfolioInsight>,
      required: true,
    },
  },
  setup(props) {
    const $n = useI18n().n;

    const inputs = computed(() => {
      const { insight } = props;
      return {
        name: shortHoldingName(insight.holding.name),
        movingAverageDays: insight.inputs.movingAverageDays,
        deltaPercent:
          typeof insight.inputs.deltaPercent === 'number'
            ? $n(insight.inputs.deltaPercent, 'percent')
            : 0,
        direction: insight.inputs.isAbove ? 'above' : 'below',
        shortRatio: insight.inputs.shortRatio,
      };
    });

    return { inputs };
  },
});
</script>
