<template>
  <p class="text-h6 text-grey-8 q-px-md dashboard-title text-weight-regular">
    {{ portfolioStore.selectedPortfolio?.title }}
  </p>
  <dashboard-kpi-summary />
  <daily-movers/>
  <portfolio-insights/>
  <portfolio-heat-map/>
  <holdings-donut class="q-mt-lg"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import DashboardKpiSummary from 'components/dashboard/DashboardKPISummary.vue';
import PortfolioHeatMap from 'components/dashboard/PortfolioHeatMap.vue';
import HoldingsDonut from 'components/dashboard/HoldingsDonut.vue';
import DailyMovers from 'components/dashboard/DailyMovers.vue';
import PortfolioInsights from 'components/dashboard/PortfolioInsights.vue';

export default defineComponent({
  name: 'MobileDashboard',
  components: {
    PortfolioInsights,
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
