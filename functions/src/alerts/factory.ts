import { Alert, Notification } from '../../../shared/types';

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

const alertConditionTitle = (alert: Alert) => alert.condition === 'gt' ? 'Crossing over' : 'Crossing below';

export default {
  priceAlert: (alert: Alert, quoteValue: number): Partial<Notification> => ({
    ...notificationDefaults,
    title: `${alert.ticker} is ${alertConditionTitle(alert)} ${formatCurrency(
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
