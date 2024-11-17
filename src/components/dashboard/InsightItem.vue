<template>
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
    <i18n-t
      class="q-mb-sm"
      keypath="insights.types.description.nearMovingAverages"
      tag="p"
    >
      <template v-slot:name>
        <i>{{ insight.holding.name }}</i>
      </template>
      <template v-slot:deltaPercent>
        <b>{{ $n(Number(insight.inputs.deltaPercent ?? 0), 'percent') }}</b>
      </template>
      <template v-slot:movingAverageDays>
        <b>{{ insight.inputs.movingAverageDays }}</b>
      </template>
      <template v-slot:direction>
        <b>{{ insight.inputs.isAbove ? 'above' : 'below' }}</b>
      </template>
    </i18n-t>
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
import { PortfolioInsight } from 'app/shared/types';

export default defineComponent({
  name: 'InsightItem',
  props: {
    insight: {
      type: Object as PropType<PortfolioInsight>,
      required: true,
    },
  },
  components: { TickerLogo },
});
</script>
