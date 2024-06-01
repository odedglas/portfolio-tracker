import { LOGIN_META, TRANSACTIONS_TYPES } from './constants';

export type LoginMode = keyof typeof LOGIN_META;

interface Deposit {
  date: number;
  value: number;
  initial?: boolean;
}

export interface Portfolio {
  id: string;
  owner: string;
  title: string;
  createdAt: number;
  currentValue: number; // TODO - Calc ( Sum of holdings current value )
  target: number;
  invested: number; // TODO - Calculated ( Sum of holdings invested )
  profit: number; // TODO - Calc ( Sum of holdings profits )
  deposits: Deposit[];
}

export type TransactionAction =
  (typeof TRANSACTIONS_TYPES)[keyof typeof TRANSACTIONS_TYPES];

export interface Transaction {
  id: string;
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

export interface Holding {
  id: string;
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
