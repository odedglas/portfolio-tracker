import { computed } from 'vue';
import { portfoliosTransformer } from 'app/shared/transformers';
import { usePortfolioStore } from 'src/stores/portfolios';
import { useI18n } from 'vue-i18n';

export const usePortfolioKpis = () => {
  const $t = useI18n().t;
  const portfolioStore = usePortfolioStore();

  const kpis = computed(() => {
    const portfolio = portfolioStore.selectedPortfolioWithHoldings;
    if (!portfolio) {
      return;
    }

    const portfolioKpis = portfoliosTransformer.portfolioKPIS(portfolio);
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
        value: portfoliosTransformer.cashFlow(portfolio),
        icon: 'account_balance',
        subtitle: {
          text: 'deposited',
          value: portfoliosTransformer.depositsValue(portfolio),
        },
      },
    ];
  });

  return { kpis };
};
