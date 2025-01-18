import { date as DateAPI } from 'quasar';

export const formatPlanDate = (date: number) =>
  DateAPI.formatDate(date, 'MMM D, YYYY');

export const formatNotificationDate = (date: number) =>
  DateAPI.formatDate(date, 'HH:mm MMM D, YY');

export const formatShortDate = (date: number) =>
  DateAPI.formatDate(date, 'MMM D, YY');

export const isToday = (date: number) =>
  DateAPI.getDateDiff(Date.now(), date, 'days') === 0;

export const daysFromNow = (date: number) =>
  DateAPI.getDateDiff(Date.now(), date, 'days');

export const daysAgo = (date: number) => {
  const daysPlural = daysFromNow(date) > 1 ? 's' : '';

  return `${daysFromNow(date)} day${daysPlural} ago`;
};

export const getDateYearMonthKey = (date: number) =>
  DateAPI.formatDate(date, 'YYYY-MM');

export const getMonthYear = (date: string) =>
  DateAPI.formatDate(date, 'MMM YYYY');
