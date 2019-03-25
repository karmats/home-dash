/**
 * Get dates of a week for a specific date
 * @param date Date to get the week for
 * @param startOnMonday Set to true to start the week on monday instead of sunday, defaults to true
 */
export const getWeekDates = (date: Date, startOnMonday = true): Date[] => {
  const result: Date[] = [];
  const daysPassed = date.getDay() - (startOnMonday ? 1 : 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(date.getTime());
    d.setDate(date.getDate() - daysPassed + i);
    result.push(d);
  }
  return result;
};
