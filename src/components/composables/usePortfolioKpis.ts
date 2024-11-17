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
      return [];
    }

    const portfolioKpis = portfoliosTransformer.portfolioKPIS(portfolio);

    console.log(portfolio, portfolioKpis);
    return [
      {
        id: 'balance',
        title: $t('dashboard.kpis.value'),
        value: portfolio.currentValue ?? 0,
        icon: 'balance',
        subtitle: {
          text: 'invested',
          value: portfolio.invested ?? 0,
        },
      },
      {
        id: 'profits',
        title: $t('dashboard.kpis.profit'),
        value: portfolioKpis.profit.value ?? 0,
        valuePercentage: portfolioKpis.profit.percentage,
        showValueSign: true,
        tooltip: {
          capital: portfolio.capitalGains ?? 0,
          realized: portfoliosTransformer.realizedGains(portfolio),
          fees: (portfolio.fees ?? 0) * -1,
        },
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
        id: 'cashflow',
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
