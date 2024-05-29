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
  currentValue: number;
  target: number;
  invested: number;
  profit: number;
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
  portfolioId: string;
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
}
