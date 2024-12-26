export const LOGIN_META = {
  login: {
    text: 'login.login',
    color: 'primary',
    switchModeText: 'login.dont_have_account',
    switchModeActionText: 'login.signup',
    isSignUp: false,
  },
  signUp: {
    text: 'login.signup',
    color: 'secondary',
    switchModeText: 'login.have_an_account',
    switchModeActionText: 'login.login',
    isSignUp: true,
  },
} as const;

export const FIREBASE_LOGIN_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
};

export const TRANSACTIONS_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
} as const;

export const INSIGHT_TYPE = {
  BELOW_52_WEEK_HIGH: 'below52WeekHigh',
  NEAR_52_WEEK_LOW: 'near52WeekLow',
  HIGH_SHORT_INTEREST: 'highShortInterest',
  NEAR_MOVING_50_AVERAGES: 'near50DaysMovingAverages',
  NEAR_MOVING_200_AVERAGES: 'near200DaysMovingAverages',
} as const;

export const NOTIFICATION_TYPE = {
  PRICE_ALERT: 'priceAlert',
} as const;
