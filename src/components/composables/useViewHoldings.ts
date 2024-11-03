import { computed } from 'vue';
import { useHoldingsStore } from 'stores/holdings';
import { shortHoldingName } from 'src/utils';

export const useViewHoldings = () => {
  const holdingsStore = useHoldingsStore();

  const viewHoldings = computed(() =>
    holdingsStore.portfolioHoldings.map((holding) => {
      const totalValue = holding.currentValue;
      const profitValue = holding.profit.value;
      const dailyChange = holding.dailyChange;

      return {
        ...holding,
        totalValue,
        shortName: shortHoldingName(holding.name),
        profit: {
          value: profitValue,
          percent: totalValue > 0 ? holding.profit.percent : 0,
        },
        daily: {
          value: dailyChange.value,
          percent: dailyChange.percent,
        },
      };
    })
  );

  return { viewHoldings };
};
