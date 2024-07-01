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
