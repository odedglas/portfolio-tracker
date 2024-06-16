<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10">
      <p class="text-h5 text-grey-7 q-mt-md">
        Portfolio's / {{ viewPortfolio?.title }}
      </p>
      <div class="flex q-gutter-md">
        <div v-for="kpi in kpis" :key="kpi.title" class="col">
          <dashboard-kpi v-bind="kpi" />
        </div>
      </div>

      <q-card class="q-mt-md" flat bordered>
        <q-card-section>
          <p class="text-h5 text-grey-8">Holdings</p>
        </q-card-section>
        <q-card-section class="row q-py-lg">
          <div class="col-11">
            <apexchart
              class="chart"
              height="350"
              type="donut"
              :options="holdingsDonutData.options"
              :series="holdingsDonutData.series"
            ></apexchart>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import VueApexCharts from 'vue3-apexcharts';
import { usePortfolioStore } from 'stores/portfolios';
import { viewTransformer } from 'src/service/portfolio';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
import { getHoldingsDonutChatOptions } from 'src/service/charts';

export default defineComponent({
  name: 'DashboardPage',
  components: {
    DashboardKpi,
    apexchart: VueApexCharts,
  },
  setup() {
    const $t = useI18n().t;
    const portfolioStore = usePortfolioStore();

    const viewPortfolio = computed(
      () => portfolioStore.selectedPortfolioWithHoldings
    );

    const kpis = computed(() => {
      let portfolio = viewPortfolio.value;
      if (!portfolio) {
        return;
      }

      const portfolioKpis = viewTransformer.portfolioKPIS(portfolio);
      return [
        {
          title: $t('dashboard.kpis.value'),
          value: portfolio.currentValue ?? 0,
          icon: 'balance',
          subtitle: {
            text: 'invested',
            value: portfolio.invested ?? 0,
          },
        },
        {
          title: $t('dashboard.kpis.profit'),
          value: portfolioKpis.profit.value ?? 0,
          valuePercentage: portfolioKpis.profit.percentage,
          showValueSign: true,
          icon: 'trending_up',
          subtitle: {
            text: 'daily',
            value: portfolioKpis.dailyChange.value,
            percentage: portfolioKpis.dailyChange.percentage,
            className:
              portfolioKpis.dailyChange.value >= 0
                ? 'text-green-5'
                : 'text-red-5',
          },
        },
        {
          title: $t('dashboard.kpis.cash_flow'),
          value: viewTransformer.cashFlow(portfolio),
          icon: 'account_balance',
          subtitle: {
            text: 'deposited',
            value: viewTransformer.depositsValue(portfolio),
          },
        },
      ];
    });

    const holdingsDonutData = computed(() => getHoldingsDonutChatOptions());

    return {
      viewPortfolio,
      kpis,
      holdingsDonutData,
    };
  },
});
</script>

<style lang="scss">
.chart {
  svg {
    overflow: visible;
  }

  .apexcharts-legend-marker {
    margin-right: 12px;
  }

  .apexcharts-legend-text {
    color: $grey-7 !important;
  }
}
</style>
