import { date as DateAPI } from 'quasar';

export const formatPlanDate = (date: number) =>
  DateAPI.formatDate(date, 'MMM D, YYYY');
