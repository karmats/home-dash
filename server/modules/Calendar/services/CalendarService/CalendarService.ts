import { getCalendarEvents } from '../../../../apis/GoogleApi';

const getCalendarEventsByDates = (from: Date, to: Date) => getCalendarEvents({ from, to });
const getNextCalendarEvents = (next: number) => getCalendarEvents({ next });

export default { getCalendarEventsByDates, getNextCalendarEvents };
