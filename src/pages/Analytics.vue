<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column analytics-page-wrapper">
      <p class="text-h5 q-mb-none text-grey-7 dashboard-title">
        {{ $t('analytics.title') }}
      </p>
      <div class="analytics-kpis-wrapper">
        <dashboard-kpi
          v-for="kpi in kpis"
          :key="`analytics-${kpi.title}`"
          v-bind="kpi"
        />
      </div>

      <analytics-graphs />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import { usePortfolioKpis } from 'components/composables/usePortfolioKpis';
import AnalyticsGraphs from 'components/analytics/AnalyticsGraphs.vue';

export default defineComponent({
  name: 'AnalyticsPage',
  components: {
    AnalyticsGraphs,
    DashboardKpi,
  },
  setup() {
    const { kpis } = usePortfolioKpis();

    return {
      kpis,
    };
  },
});
</script>

<style lang="scss">
.analytics-page-wrapper {
  gap: 16px;
}

.analytics-kpis-wrapper {
  display: grid;
  gap: 16px;
  grid-template-rows: repeat(1, auto);
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas: 'kpi kpi kpi';
}
</style>
