import { defineStore } from 'pinia';
import { Alert } from 'app/shared/types/entities';
import alertsAPI from 'src/service/alert';
import { useUserStore } from 'stores/user';
import { usePortfolioStore } from 'stores/portfolios';

export const useAlertsStore = defineStore('alerts', {
  state: (): { alerts: Alert[] } => ({
    alerts: [],
  }),
  getters: {
    portfolioAlerts(state) {
      const portfolioStore = usePortfolioStore();

      return state.alerts.filter(
        (alert) => alert.portfolioId === portfolioStore.selectedPortfolio?.id
      );
    },
  },
  actions: {
    async listAlerts() {
      const userStore = useUserStore();
      const alertsOwner = userStore.user?.uid;

      if (!alertsOwner) {
        return;
      }

      this.alerts = await alertsAPI.list(alertsOwner);
    },
  },
});
