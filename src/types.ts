import { LOGIN_META } from './constants';

export type LoginMode = keyof typeof LOGIN_META;

export interface Portfolio {
  name: string;
  currencyCode: string; // TODO - Create a CurrencyCode type
  currentValue: number;
  totalVested: number;
  taxRate: number;
  yearlyTarget?: number;
}
