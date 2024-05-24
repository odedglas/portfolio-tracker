import { date as DateAPI } from 'quasar';

export const startOfDay = (date: Date) =>
  DateAPI.addToDate(DateAPI.startOfDate(date, 'day'), { hours: 3 });

export const tomorrow = (date: Date) => DateAPI.addToDate(date, { days: 1 });

export const toEpocNumeric = (date: Date) => date.getTime() / 1e3;

export const fromEpocNumeric = (date: number) => new Date(date * 1e3);
