<template>
  <p class="text-h6 text-grey-8 q-px-md dashboard-title text-weight-regular">
    {{ portfolioStore.selectedPortfolio?.title }}
  </p>
  <dashboard-kpi-summary />
  <daily-movers />
  <portfolio-heat-map :bordered="false" />
  <holdings-donut class="q-mt-lg" :bordered="false" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import DashboardKpiSummary from 'components/dashboard/DashboardKPISummary.vue';
import PortfolioHeatMap from 'components/dashboard/PortfolioHeatMap.vue';
import HoldingsDonut from 'components/dashboard/HoldingsDonut.vue';
import DailyMovers from 'components/dashboard/DailyMovers.vue';

export default defineComponent({
  name: 'MobileDashboard',
  components: {
    DailyMovers,
    HoldingsDonut,
    PortfolioHeatMap,
    DashboardKpiSummary,
  },
  setup() {
    const portfolioStore = usePortfolioStore();

    return {
      portfolioStore,
    };
  },
});
</script>
