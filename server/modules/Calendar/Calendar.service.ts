import { CalendarEvent } from '../../../shared/types';
import { getCalendarEvents } from '../../apis/Google.api';

const getCalendarEventsByDates = (from: Date, to: Date): Promise<ReadonlyArray<CalendarEvent>> =>
  getCalendarEvents({ from, to });
const getNextCalendarEvents = (next: number): Promise<ReadonlyArray<CalendarEvent>> => getCalendarEvents({ next });

export default { getCalendarEventsByDates, getNextCalendarEvents };
