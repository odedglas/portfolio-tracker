import { LOGIN_META, TRANSACTIONS_TYPES } from './constants';

export type LoginMode = keyof typeof LOGIN_META;

export interface Entity {
  id: string;
}

export interface Deposit {
  date: number;
  value: number;
  initial?: boolean;
}

export interface DepositEntity extends Deposit {
  id: string;
  index: number;
}

export interface Portfolio extends Entity {
  owner: string;
  title: string;
  createdAt: number;
  currentValue: number;
  target: number;
  invested: number;
  profit: number;
  realized?: number;
  captialGains?: number;
  deposits: Deposit[];
}

export type TransactionAction =
  (typeof TRANSACTIONS_TYPES)[keyof typeof TRANSACTIONS_TYPES];

export interface Transaction extends Entity {
  createdAt: number;
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
}

export interface Holding extends Entity {
  createdAt: number;
  shares: number;
  ticker: string;
  avgPrice: number;
  name: string;
  logoImage?: string;
  portfolioId: string;
  fees?: number;
  invested: number;
  realizedProfits?: number;
}

export interface HoldingsSummary {
  shares: number;
  invested: number;
  profit: number;
  currentValue: number;
}

export interface HoldingWithProfits extends Holding {
  currentValue: number;
  profit: {
    value: number;
    percent: number;
  };
  dailyChange: {
    value: number;
    percent: number;
  };
}
