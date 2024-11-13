import * as logger from 'firebase-functions/logger';
import { Alert } from '../../../shared/types';
import { getCollection, updateDocuments } from '../utils/getCollection';
import { getTickersQuotes } from '../utils/getTickersQuotes';
import { sendNotification } from '../utils/notifications';
import notificationsFactory from './factory';

const isConditionMatched = (
  condition: string,
  value: number,
  quoteValue: number
) => {
  return condition === 'gt' ? quoteValue >= value : quoteValue <= value;
};

const conditionOpposite = (condition: string) => {
  return condition === 'gt' ? 'lt' : 'gt';
};

export const alertsHandler = async () => {
  const alertsCollection = await getCollection<Alert>('alerts');

  const alerts = alertsCollection.filter(
    (alert) => alert.active && alert.expiration > Date.now()
  );

  if (!alerts.length) {
    logger.info('No active alerts found');
    return;
  }

  logger.info(`Alerts Handler Start, processing ${alerts.length} alerts`);

  const tickerQuotes = await getTickersQuotes(
    Array.from(new Set(alerts.map((alert) => alert.ticker)))
  );

  const updatedAlerts = alerts
    .map((alert) => {
      const quote = tickerQuotes.find((quote) => quote.symbol === alert.ticker);

      if (!quote) {
        logger.error(`Quote not found for ticker ${alert.ticker}`);
        return;
      }

      const quoteValue = quote[alert.valueProperty];
      if (
        isConditionMatched(alert.condition, alert.value, quoteValue) &&
        !alert.lastTriggeredDate
      ) {
        logger.info('Found alert matching condition', { alert, quoteValue });

        if (alert.once) {
          alert.active = false;
        }

        alert.lastTriggeredDate = Date.now();
        alert.lastTriggeredPrice = quoteValue;

        sendNotification(
          alert.owner,
          notificationsFactory.priceAlert(alert, quoteValue)
        );

        return alert;
      } else {
        logger.info('Alert condition skipped', { alert, quoteValue });
      }

      // Check if alert should be reactivated - Rather last trigger price is opposite of the condition
      if (
        alert.lastTriggeredPrice &&
        !alert.once &&
        isConditionMatched(
          conditionOpposite(alert.condition),
          alert.value,
          quoteValue
        )
      ) {
        logger.info('Re-triggering alert, opposite condition matched', {
          alert,
          quoteValue,
        });
        alert.lastTriggeredPrice = 0;
        alert.lastTriggeredDate = 0;
        alert.active = true;

        return alert;
      }

      return;
    })
    .filter(Boolean) as Alert[];

  await updateDocuments('alerts', updatedAlerts);

  logger.info('Alerts Handler End', { updatedAlerts: updatedAlerts.length });
};
