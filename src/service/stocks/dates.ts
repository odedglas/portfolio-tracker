import { date as DateAPI } from 'quasar';

export const startOfDay = (date: Date, startHours = 0) =>
  DateAPI.addToDate(DateAPI.startOfDate(date, 'day'), { hours: startHours });

export const midDay = (date: Date) => startOfDay(date, 12);
export const endOfDay = (date: Date) => startOfDay(date, 23.99);

export const buildDateRange = (from: Date, to: Date) => {
  const range = [];
  let current = midDay(from);

  while (current <= to) {
    range.push(current);
    current = tomorrow(current);
  }
  return range;
}

export const tomorrow = (date: Date) => DateAPI.addToDate(date, { days: 1 });

export const toEpocNumeric = (date: Date) => date.getTime() / 1e3;

export const fromEpocNumeric = (date: number) => new Date(date * 1e3).getTime();
