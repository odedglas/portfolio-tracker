import { defineStore } from 'pinia';
import { Alert } from 'app/shared/types/entities';
import alertsAPI from 'src/service/alert';
import { useUserStore } from 'stores/user';
import { usePortfolioStore } from 'stores/portfolios';
import { useLoadingStore } from 'stores/loading';

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

    async remove(alertId: string) {
      await alertsAPI.delete(alertId);
      this.alerts = this.alerts.filter((alert) => alert.id !== alertId);
    },

    async toggleActive(alertId: string) {
      const loadingStore = useLoadingStore();
      const alert = this.alerts.find((alert) => alert.id === alertId);

      if (!alert) {
        return;
      }

      const newAlertState = !alert.active;
      const lastValues = newAlertState
        ? { lastTriggeredPrice: 0, lastTriggeredDate: 0 }
        : {};

      console.log('Updating ', lastValues);
      await loadingStore.emitLoadingTask(() =>
        alertsAPI.update({ active: newAlertState, ...lastValues }, alertId)
      );

      alert.active = newAlertState;
    },
  },
});
