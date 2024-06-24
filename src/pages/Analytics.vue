<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column">
      <p class="text-h5 text-grey-7 dashboard-title">Analytics</p>
      <div class="flex q-gutter-md">
        <div v-for="kpi in kpis" :key="kpi.title" class="col">
          <dashboard-kpi v-bind="kpi" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import { usePortfolioKpis } from 'components/composables/usePortfolioKpis';

export default defineComponent({
  name: 'AnalyticsPage',
  components: {
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
