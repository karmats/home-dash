import { differenceInCalendarDays, formatRelative, subDays, format } from 'date-fns';
import { sv } from 'date-fns/locale';

export const dateToTime = (date: Date): string =>
  format(date, 'HH:mm');

export const timeAgo = (date: Date): string => {
  const now = new Date();
  return formatRelative(subDays(date, differenceInCalendarDays(now, date)), now, { locale: sv });
};
