import { LOGIN_META, TRANSACTIONS_TYPES } from '../constants';

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

export type Portfolio = Entity &
  Timestamped &
  Profitable & {
    owner: string;
    title: string;
    target: number;
    deposits: Deposit[];
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
