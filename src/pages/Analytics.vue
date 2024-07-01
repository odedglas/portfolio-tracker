<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column">
      <p class="text-h5 text-grey-7 dashboard-title">Analytics</p>
      <div class="flex q-gutter-md">
        <div v-for="kpi in kpis" :key="kpi.title" class="col">
          <dashboard-kpi v-bind="kpi" />
        </div>
      </div>

      <portfolio-performance/>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import { usePortfolioKpis } from 'components/composables/usePortfolioKpis';
import PortfolioPerformance from 'components/analytics/PortfolioPerformance.vue';

export default defineComponent({
  name: 'AnalyticsPage',
  components: {
    PortfolioPerformance,
    DashboardKpi
  },
  setup() {
    const { kpis } = usePortfolioKpis();

    return {
      kpis,
    };
  },
});
</script>
