import { date as dateUtils } from 'quasar';
import { getCollections, firestoreAPI } from 'src/service/firebase/collections';
import { Alert, AllocationPlan, Portfolio } from 'app/shared/types';

const alertsCollection = () => getCollections().alerts;

const api = {
  get: async (alertId: string) =>
    firestoreAPI.getDocument(alertsCollection(), alertId),
  update: async (data: Partial<Alert>, alertId?: string): Promise<Alert> => {
    if (!alertId) {
      // TODO - Handle alert expiration if any
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
    portfolio: Portfolio
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
        expiration: dateUtils.addToDate(new Date(), { years: 1 }).getTime(),
        portfolioId: portfolio.id,
        owner: portfolio.owner,
      },
      plan.alertId
    );
  },
};

export default api;
