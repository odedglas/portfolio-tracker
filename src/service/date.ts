import { date as DateAPI } from 'quasar';

export const formatPlanDate = (date: number) =>
  DateAPI.formatDate(date, 'MMM D, YYYY');

export const formatNotificationDate = (date: number) =>
  DateAPI.formatDate(date, 'hh:mm MMM D, YY');

export const formatShortDate = (date: number) =>
  DateAPI.formatDate(date, 'MMM D, YY');

export const isToday = (date: number) =>
  DateAPI.getDateDiff(Date.now(), date, 'days') === 0;

export const daysFromNow = (date: number) =>
  DateAPI.getDateDiff(Date.now(), date, 'days');
