<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10">
      <p class="text-h5 text-grey-7 q-mt-md">{{ viewPortfolio?.title }}</p>
      <div class="flex q-gutter-md">
        <div v-for="kpi in kpis" :key="kpi.title" class="col">
          <dashboard-kpi v-bind="kpi" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePortfolioStore } from 'stores/portfolios';
import { viewTransformer } from 'src/service/portfolio';
import DashboardKpi from 'components/dashboard/DashboardKPI.vue';
export default defineComponent({
  name: 'DashboardPage',
  components: {
    DashboardKpi,
  },
  setup() {
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
          title: 'Value',
          value: portfolio.currentValue ?? 0,
          icon: 'account_balance',
          subtitle: {
            text: 'invested',
            value: portfolio.invested ?? 0,
          },
        },
        {
          title: 'Total profit',
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
          title: 'Cash flow',
          value: viewTransformer.cashFlow(portfolio),
          icon: 'balance',
          subtitle: {
            text: 'deposited',
            value: viewTransformer.depositsValue(portfolio),
          },
        },
      ];
    });

    return {
      viewPortfolio,
      kpis,
    };
  },
});
</script>
