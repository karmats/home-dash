const getDaysPassedSinceWeekStart = (date: Date, startOnMonday: boolean) => {
  const day = date.getDay();
  if (startOnMonday) {
    // Special case on sunday
    return day - (day === 0 ? -6 : 1);
  }
  return day;
};

/**
 * Get dates of a week for a specific date
 * @param date Date to get the week for
 * @param startOnMonday Set to true to start the week on monday instead of sunday, defaults to true
 */
export const getWeekDates = (date: Date, startOnMonday = true): Date[] => {
  const result: Date[] = [];
  const daysPassed = getDaysPassedSinceWeekStart(date, startOnMonday);
  for (let i = 0; i < 7; i++) {
    const d = new Date(date.getTime());
    d.setDate(date.getDate() - daysPassed + i);
    result.push(d);
  }
  return result;
};

/**
 * Get current week start and end dates.
 * @param startOnMonday Set to true to start the week on monday instead of sunday, defaults to true
 */
export const getCurrentWeekStartAndEnd = (startOnMonday = true): { from: Date; to: Date } => {
  const now = new Date(Date.now());
  let daysPassed = getDaysPassedSinceWeekStart(now, startOnMonday);

  const from = new Date(now.getTime());
  from.setDate(now.getDate() - daysPassed);

  const to = new Date(now.getTime());
  to.setDate(now.getDate() - daysPassed + 6);
  return {
    from,
    to
  };
};

/**
 * Check if two dates is the same day.
 * @param date1 Firtst date
 * @param date2 Second date
 */
export const isSameDay = (date1: Date, date2: Date) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const rightPadNumberWithZero = (num: number) => (num < 10 ? `0${num}` : num.toString());
/**
 * Date to time string in format HH:mm.
 * @param date
 */
export const getDateAsTimeString = (date: Date) =>
  `${rightPadNumberWithZero(date.getHours())}:${rightPadNumberWithZero(date.getMinutes())}`;

/**
 * Date to date string in format yyyy-MM-dd
 * @param date
 */
export const getDateAsIsoString = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Month name for a date with a specific locale.
 * @param date
 * @param locale
 */
export const getMonthName = (date: Date, locale: string) => date.toLocaleString(locale, { month: 'long' });

/**
 * Weekday name for a date with a specific locale.
 * @param date
 * @param locale
 */
export const getWeekdayName = (date: Date, locale: string) => date.toLocaleString(locale, { weekday: 'short' });

export const isToday = (date: Date) => {
  const now = new Date();
  return (
    now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()
  );
};
