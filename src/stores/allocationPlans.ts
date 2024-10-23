import { defineStore } from 'pinia';
import { AllocationPlan, Portfolio } from 'app/shared/types';
import { portfoliosTransformer } from 'app/shared/transformers';

export const useAllocationPlansStore = defineStore('allocationPlans', {
  state: (): { allocationPlans: AllocationPlan[] } => ({
    allocationPlans: [],
  }),
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
