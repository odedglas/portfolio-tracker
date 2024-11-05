<template>
  <p class="text-h6 text-grey-8 q-px-md text-weight-regular">
    {{ $t('analytics.title') }}
  </p>
  <div class="flex column q-gap-lg">
    <analytics-graphs />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AnalyticsGraphs from 'components/analytics/AnalyticsGraphs.vue';

export default defineComponent({
  name: 'MobileAnalytics',
  components: { AnalyticsGraphs },
  setup() {
    return {};
  },
});
</script>
