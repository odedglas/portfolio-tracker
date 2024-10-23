import { defineStore } from 'pinia';
import { AllocationPlan, Portfolio } from 'app/shared/types';
import { portfoliosTransformer } from 'app/shared/transformers';
import { usePortfolioStore } from 'stores/portfolios';

export const useAllocationPlansStore = defineStore('allocationPlans', {
  state: (): { allocationPlans: AllocationPlan[] } => ({
    allocationPlans: [],
  }),
  getters: {
    allocationsSummary(state) {
      const portfolioStore = usePortfolioStore();

      const freeCashFlow = portfolioStore.freeCashFlow;

      const plannedValue = state.allocationPlans.reduce(
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
    setAllocationsPlans(portfolio: Portfolio) {
      const plans = portfolio.allocationPlans ?? [];

      const freeCashFlow = portfoliosTransformer.cashFlow(portfolio);

      this.allocationPlans = plans.map((plan) => {
        const totalValue = plan.shares * plan.targetPrice;
        const allocationUsage = totalValue / freeCashFlow;

        return { ...plan, totalValue, allocationUsage };
      });
    },
  },
});
