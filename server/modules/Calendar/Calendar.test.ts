import { vi } from 'vitest';
import { CalendarEvent } from '../../../shared/types';
import { DEFAULT_HEADERS } from '../../utils';
import CalendarController from './Calendar.controller';

const MOCK_CALENDAR_BY_DATES_EVENTS: CalendarEvent[] = [
  {
    from: { date: '2020-08-20' },
    to: { date: '2020-08-21' },
    summary: 'Calendar by dates',
  },
];
const MOCK_NEXT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    from: { date: '2020-08-20' },
    to: { date: '2020-08-21' },
    summary: 'Next calendar events',
  },
];

vi.mock('../Authentication', () => ({
  AuthenticationService: {
    isConnectedToGoogle: () => Promise.resolve(true),
  },
}));
vi.mock('./Calendar.service', () => ({
  __esModule: true,
  default: {
    getCalendarEventsByDates: () => Promise.resolve(MOCK_CALENDAR_BY_DATES_EVENTS),
    getNextCalendarEvents: () => Promise.resolve(MOCK_NEXT_CALENDAR_EVENTS),
  },
}));
vi.mock('../../services/PollHandler.service', () => ({}));

describe('Calendar server', () => {
  describe('Controller', () => {
    it('calls service on correct request', () => {
      const req: any = {
        query: {
          next: '10',
        },
      };
      const res: any = {
        writeHead: (status: number, headers: { [key: string]: string }) => {
          expect(status).toBe(200);
          expect(headers).toEqual(DEFAULT_HEADERS);
        },
        write: (body: string) => {
          expect(body).toEqual(JSON.stringify(MOCK_NEXT_CALENDAR_EVENTS));
          return true;
        },
        end: () => {},
      };

      CalendarController.getCalendarEventsFromRequest(req, res);
    });
  });
});
