import { LOGIN_META } from './constants';

export type LoginMode = keyof typeof LOGIN_META;

interface Deposit {
  date: number;
  value: number;
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
