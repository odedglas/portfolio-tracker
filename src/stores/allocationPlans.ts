import { defineStore } from 'pinia';
import { AllocationPlan } from 'app/shared/types';
import { portfoliosTransformer } from 'app/shared/transformers';
import { usePortfolioStore } from 'stores/portfolios';
import { useHoldingsStore } from 'stores/holdings';

export const useAllocationPlansStore = defineStore('allocationPlans', {
  state: (): { allocationPlans: AllocationPlan[] } => ({
    allocationPlans: [],
  }),
  getters: {
    plans(state) {
      const portfolioStore = usePortfolioStore();
      const holdingsStore = useHoldingsStore();

      const selected = portfolioStore.selectedPortfolio;

      if (!selected) {
        return [];
      }

      const invested = holdingsStore.portfolioHoldings.reduce(
        (acc, holding) => acc + holding.invested,
        0
      );
      const freeCashFlow = portfoliosTransformer.cashFlow({
        ...selected,
        invested,
      });

      return state.allocationPlans.map((plan) => {
        const allocationUsage = (plan.totalValue ?? 0) / freeCashFlow;

        return { ...plan, allocationUsage };
      });
    },
    allocationsSummary(state) {
      const portfolioStore = usePortfolioStore();

      const freeCashFlow = portfolioStore.freeCashFlow;

      const plannedValue = state.allocationPlans?.reduce(
        (acc, plan) => acc + (plan.totalValue ?? 0),
        0
      );

      const allocationUsage =
        freeCashFlow > 0 ? plannedValue / freeCashFlow : 0;

      const availableCash = freeCashFlow - plannedValue;

      return { plannedValue, allocationUsage, availableCash };
    },
  },
  actions: {
    setAllocationsPlans(plans: AllocationPlan[]) {
      this.allocationPlans = plans;
    },
  },
});
