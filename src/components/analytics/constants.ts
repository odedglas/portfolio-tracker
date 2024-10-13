import { yearToDateDays } from 'src/service/stocks/dates';

export type Option = {
  label: string;
  value: string;
  [key: string]: unknown;
  order?: number;
};

export const benchmarkOptions: Option[] = [
  { label: 'S&P 500', value: 'SPY', order: 1 },
  { label: 'Nasdaq 100', value: 'QQQ', order: 2 },
  { label: 'Russel 2000', value: 'IWM', order: 3 },
  { label: 'Dow Jones', value: 'DIA', order: 4 },
];

export const timeRangeOptions: Option[] = [
  { label: '7d', value: '5d', days: 7 },
  { label: '1m', value: '1m', days: 30 },
  { label: '3m', value: '3m', days: 90 },
  { label: '6m', value: '6m', days: 180 },
  { label: 'YTD', value: 'ytd', days: yearToDateDays() },
  { label: '1y', value: '1y', days: 365 },
  { label: '5y', value: '5y', days: 365 * 5 },
];
