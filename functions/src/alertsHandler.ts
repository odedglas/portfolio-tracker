import * as logger from 'firebase-functions/logger';
import { Alert, Notification } from '../../shared/types';
import { getCollection, updateDocuments } from './utils/getCollection';
import { getTickersQuotes } from './utils/getTickersQuotes';
import { sendNotification } from './utils/notifications';

const notificationDefaults = {
  sendPush: true,
  createdAt: Date.now(),
  unread: true,
};

const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return formatter.format(value);
};

const notificationsFactory = {
  // TODO - Format notification Heading / Body.
  priceAlert: (alert: Alert, quoteValue: number): Partial<Notification> => ({
    ...notificationDefaults,
    title: `${alert.ticker} is ${alert.condition} ${formatCurrency(
      alert.value
    )}`,
    type: 'priceAlert',
    body: `The value of ${alert.ticker} is now ${formatCurrency(
      quoteValue
    )} which is under ${formatCurrency(alert.value)}`,
    icon: alert.logoImage,
    owner: alert.owner,
    data: {
      ticker: alert.ticker,
      logo: alert.logoImage,
      portfolioId: alert.portfolioId,
      triggerPrice: quoteValue,
      targetPrice: alert.value,
    },
  }),
};

export const alertsHandler = async () => {
  const alertsCollection = await getCollection<Alert>('alerts');

  const alerts = alertsCollection.filter(
    (alert) => alert.active && alert.expiration > Date.now()
  );

  logger.info(`Alerts Handler Start, processing ${alerts.length} alerts`);

  const tickerQuotes = await getTickersQuotes(
    alerts.map((alert) => alert.ticker)
  );

  const updatedAlerts = alerts
    .map((alert) => {
      const quote = tickerQuotes.find((quote) => quote.symbol === alert.ticker);

      if (!quote) {
        logger.error(`Quote not found for ticker ${alert.ticker}`);
        return;
      }

      const quoteValue = quote[alert.valueProperty];
      const alertConditionMatched =
        alert.condition === 'gt'
          ? quoteValue >= alert.value
          : quoteValue <= alert.value;

      // TODO - Add check for last trigger date (Add alert frequency)
      if (alertConditionMatched) {
        logger.info('Found alert matching condition', { alert, quoteValue });

        // TODO - Remove this assumption of every alert is being triggered once.
        // alert.active = false;
        alert.lastTriggered = Date.now();

        sendNotification(
          alert.owner,
          notificationsFactory.priceAlert(alert, quoteValue)
        );

        return alert;
      }

      return;
    })
    .filter(Boolean) as Alert[];

  await updateDocuments('alerts', updatedAlerts);

  logger.info('Alerts Handler End', { updatedAlerts: updatedAlerts.length });
};
