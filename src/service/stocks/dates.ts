import { date as DateAPI } from 'quasar';

export const startOfDay = (date: Date, startHours = 0) =>
  DateAPI.addToDate(DateAPI.startOfDate(date, 'day'), { hours: startHours });

const yesterday = (date: Date = new Date()) =>
  DateAPI.subtractFromDate(date, { days: 1 });

export const midDay = (date: Date) => startOfDay(date, 12);
export const endOfDay = (date: Date) => startOfDay(date, 23.99);

export const yearToDateDays = (date: Date = new Date()) => {
  const startOfYear = DateAPI.startOfDate(date, 'year');

  return DateAPI.getDateDiff(date, startOfYear, 'days');
};

export const buildDateRange = (from: Date, to: Date, daysInterval = 1) => {
  const range = [];
  let current = midDay(from);

  while (current <= to) {
    range.push(current);
    current = DateAPI.addToDate(current, { days: daysInterval });
  }
  return range;
};

export const buildDateRangeFromToday = (days = 30) => {
  const periodEnd = midDay(yesterday());
  const periodStart = DateAPI.subtractFromDate(periodEnd, { days: days - 1 });

  return buildDateRange(periodStart, periodEnd).map((date) => date.getTime());
};

export const tomorrow = (date: Date) => DateAPI.addToDate(date, { days: 1 });

export const toEpocNumeric = (date: Date) => date.getTime() / 1e3;

export const fromEpocNumeric = (date: number) => new Date(date * 1e3).getTime();
