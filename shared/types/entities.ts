import { User as FirebaseUser } from 'firebase/auth';
import { NotificationPayload } from 'firebase/messaging';
import {
  INSIGHT_TYPE,
  LOGIN_META,
  NOTIFICATION_TYPE,
  TRANSACTIONS_TYPES,
} from '../constants';

// Shared types
export type Entity = {
  id: string;
};

type Timestamped = {
  createdAt: number;
};

type Profitable = {
  profit: number;
  currentValue: number;
  realized?: number;
  capitalGains?: number;
  dailyChange?: number;
  fees?: number;
  invested: number;
};

type DepositType = 'deposit' | 'withdrawal' | 'balance';

type TransactionAction =
  (typeof TRANSACTIONS_TYPES)[keyof typeof TRANSACTIONS_TYPES];

export type LoginMode = keyof typeof LOGIN_META;

export type AppUser = {
  uid: string;
  messagingToken?: string;
  devicesTokenMap?: Record<string, string>;
  settings: {
    notificationsEnabled: boolean;
  };
};

export type User = FirebaseUser & AppUser & Entity;

export type Deposit = {
  date: number;
  value: number;
  type: DepositType;
  initial?: boolean;
  notes?: string;
};

export type DepositEntity = Deposit &
  Entity & {
    index: number;
  };

export type StockPlanType = 'espp' | 'rsu';

export type StockPlanOrder = Entity & {
  date: number;
  shares: number;
  price: number;

  // Computed
  taxComponent?: number;
  baseValue?: number;
  totalValue?: number;
  capitalGain?: number;
  netGain?: number;
  profitPercent?: number;
  isAbove102Entitlement?: boolean;
};

export type StocksPlan = Entity & {
  identifier: string;
  grantDate: number;
  vestingEndDate: number;
  vestingMonthsInterval: number;
  grantPrice: number;
  ticker: string;
  name: string;
  logoImage?: string;
  type: StockPlanType;
  amount: number;
  cliff?: boolean;
  terminationDate?: number;

  // Plan orders
  orders: StockPlanOrder[];
  soldShares?: number;
  availableShares?: number;

  // Computed properties
  vestingPeriods?: number[];
  vestedPeriods?: number;
  nextVesting?: number;
  lastVested?: number;
  vested?: number;
  potentialValue?: number;
  sellableValue?: number;
  entitlement102Date?: number;
  is102Entitled?: boolean;
  marketPrice?: number;
};

export type AllocationPlan = Entity & {
  name: string;
  ticker: string;
  logoImage: string;
  targetPrice: number;
  shares: number;
  alertId?: string;

  // Computed
  totalValue?: number;
  allocationUsage?: number;
};

export type Portfolio = Entity &
  Timestamped &
  Profitable & {
    owner: string;
    title: string;
    target: number;
    deposits: Deposit[];
    stocksPlans?: StocksPlan[];
    allocationPlans?: AllocationPlan[];
  };

export type PortfolioHistory = Profitable & {
  portfolioId: string;
  date: number;
  deposited: number;
  cashFlow: number;
  profitPercent: number;
  dailyChangePercent?: number;
};

export type Transaction = Entity &
  Timestamped & {
    action: TransactionAction;
    date: number;
    shares: number;
    actualShares: number;
    price: number;
    fees?: number;
    ticker: string;
    name: string;
    logoImage?: string;
    paidPrice?: number;
    portfolioId: string;
    realizedProfit?: number;
  };

export type Holding = Entity &
  Timestamped & {
    shares: number;
    ticker: string;
    avgPrice: number;
    name: string;
    logoImage?: string;
    portfolioId: string;
    fees?: number;
    invested: number;
    realizedProfits?: number;
  };

export type HoldingsSummary = Profitable & {
  shares: number;
};

export type HoldingWithProfits = Holding & {
  currentValue: number;
  profit: {
    value: number;
    percent: number;
  };
  dailyChange: {
    value: number;
    percent: number;
  };
};

type InsightType = (typeof INSIGHT_TYPE)[keyof typeof INSIGHT_TYPE];

export type PortfolioInsight = {
  type: InsightType;
  inputs: Record<string, string | number | boolean>;
  tags?: {
    name: string;
    value: number;
    format?: string;
  }[];
  holding: Holding;
};

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

type RequiredNotificationData = {
  portfolioId: string;
};

export type PriceAlertNotificationData = RequiredNotificationData & {
  ticker: string;
  logo?: string;
  targetPrice: number;
  triggerPrice: number;
};

export type Notification = Entity &
  NotificationPayload & {
    owner: string;
    createdAt: number;
    unread: boolean;
    type: NotificationType;
    sendPush: boolean;
    data: PriceAlertNotificationData;
  };

type AlertCondition = 'above' | 'below';
type AlertValueProperty =
  | 'regularMarketPrice'
  | 'fiftyDayAverage'
  | 'twoHundredDayAverage';

export type Alert = Entity & {
  value: number;
  owner: string;
  valueProperty: AlertValueProperty;
  once: boolean;
  active: boolean;
  ticker: string;
  logoImage?: string;
  portfolioId: string;
  condition: AlertCondition;
  expiration: number;
  lastTriggered?: number;
};
