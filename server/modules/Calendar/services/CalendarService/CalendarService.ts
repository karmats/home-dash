import { getCalendarEvents } from '../../apis';

const getEvents = (from: Date, to: Date) => {
  return getCalendarEvents(from, to);
};

export default { getEvents };
