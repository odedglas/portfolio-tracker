import { LOGIN_META } from './constants';

export type LoginMode = keyof typeof LOGIN_META;

export interface Portfolio {
  id: string;
  owner: string;
  title: string;
  createdAt: number;
  currentValue: number;
  target: number;
  invested: number;
  profit: number;
}
