import { getCollections, firestoreAPI } from 'src/service/firebase/collections';
import { Alert, AllocationPlan } from 'app/shared/types';

const alertsCollection = () => getCollections().alerts;

const api = {
  get: async (alertId: string) =>
    firestoreAPI.getDocument(alertsCollection(), alertId),
  update: async (data: Partial<Alert>, alertId?: string): Promise<Alert> => {
    if (!alertId) {
      const result = await firestoreAPI.addDocument(alertsCollection(), data);
      alertId = result.id;
    } else {
      await firestoreAPI.updateDocument(alertId, alertsCollection(), data);
    }

    return await api.get(alertId);
  },
  delete: async (alertId: string) =>
    firestoreAPI.deleteDocument(alertId, alertsCollection()),
  createAllocationPlanTargetPriceAlert: (
    plan: AllocationPlan,
    portfolioId: string
  ) => {
    return api.update(
      {
        value: plan.targetPrice,
        valueProperty: 'regularMarketPrice',
        ticker: plan.ticker,
        logoImage: plan.logoImage,
        once: true,
        active: true,
        condition: 'below',
        portfolioId: portfolioId,
      },
      plan.alertId
    );
  },
};

export default api;
