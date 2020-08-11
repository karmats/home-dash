import { getCalendarEvents } from '../../apis/Google.api';

const getCalendarEventsByDates = (from: Date, to: Date) => getCalendarEvents({ from, to });
const getNextCalendarEvents = (next: number) => getCalendarEvents({ next });

export default { getCalendarEventsByDates, getNextCalendarEvents };
