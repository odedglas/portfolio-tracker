import { defineStore } from 'pinia';
import { AllocationPlan, Portfolio } from 'app/shared/types';
import { portfoliosTransformer } from 'app/shared/transformers';
import { usePortfolioStore } from 'stores/portfolios';
import { useHoldingsStore } from 'stores/holdings';
import alertAPI from 'src/service/alert';
import portfolioAPI from 'src/service/portfolio';

const syncPlanNotification = async (
  plan: AllocationPlan,
  portfolio: Portfolio,
  remove: boolean,
  isNew: boolean
) => {
  if (remove && plan.alertId) {
    await alertAPI.delete(plan.alertId);
    return;
  }

  let alertId = plan.alertId;

  if (isNew) {
    const alert = await alertAPI.createAllocationPlanTargetPriceAlert(
      plan,
      portfolio
    );

    alertId = alert.id;
  } else {
    await alertAPI.update({ value: plan.targetPrice }, plan.alertId);
  }

  return alertId;
};

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
    async updateAllocationPlan(plan: AllocationPlan, remove = false) {
      const portfolioStore = usePortfolioStore();

      const portfolio = portfolioStore.selectedPortfolio;
      if (!portfolio) {
        return;
      }

      const filteredPlans = portfolio.allocationPlans?.filter(
        (allocationPlan) => allocationPlan.id !== plan.id
      );

      const isNew = filteredPlans?.length === portfolio.allocationPlans?.length;

      portfolio.allocationPlans = [...(filteredPlans ?? [])];

      const alertId = await syncPlanNotification(
        plan,
        portfolio,
        remove,
        isNew
      );

      if (!remove) {
        plan.alertId = alertId;
        portfolio.allocationPlans.push(plan as AllocationPlan);
      }

      this.setAllocationsPlans(portfolio.allocationPlans);

      return portfolioAPI.update(portfolio, portfolio.id);
    },
  },
});
