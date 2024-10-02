<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 dashboard-grid">
      <p class="text-h5 text-grey-7 dashboard-title">
        Portfolio's / {{ viewPortfolio?.title }}
      </p>
      <div v-for="(kpi, index) in kpis" :key="kpi.title" class="col">
        <dashboard-kpi v-bind="kpi" :class="`dashboard-kpi-${index}`" />
      </div>
      <holdings-donut class="col-8 dashboard-holdings-donut q-mt-lg" />
      <portfolio-heat-map class="dashboard-portfolio-heat-map" />
      <daily-movers class="dashboard-daily-movers" />
    </div>
    <quick-add />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import { usePortfolioKpis } from 'src/components/composables/usePortfolioKpis';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import HoldingsDonut from 'components/dashboard/HoldingsDonut.vue';
import PortfolioHeatMap from 'components/dashboard/PortfolioHeatMap.vue';
import QuickAdd from 'components/dashboard/QuickAdd.vue';
import DailyMovers from 'components/dashboard/DailyMovers.vue';

export default defineComponent({
  name: 'DashboardPage',
  components: {
    DailyMovers,
    QuickAdd,
    PortfolioHeatMap,
    HoldingsDonut,
    DashboardKpi,
  },
  setup() {
    const portfolioStore = usePortfolioStore();
    const { kpis } = usePortfolioKpis();

    const viewPortfolio = computed(
      () => portfolioStore.selectedPortfolioWithHoldings
    );

    return {
      viewPortfolio,
      kpis,
    };
  },
});
</script>

<style lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, auto);
  grid-column-gap: 16px;
  grid-template-areas:
    'title title title'
    'kpi kpi kpi'
    'donut donut heatmap'
    'daily_movers daily_movers daily_movers';
}

.dashboard-quick-add {
  height: 40px;
}

.dashboard-title {
  grid-area: title;
}
.dashboard-holdings-donut {
  grid-area: donut;
}

.dashboard-portfolio-heat-map {
  grid-area: heatmap;
}
.dashboard-daily-movers {
  grid-area: daily_movers;
}
</style>
