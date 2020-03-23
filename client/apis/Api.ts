import { Forecast, CalendarEvent, Temperature, HomeAlarmInfo } from '../../shared/types';

const API_PORT = 4000;

const getBaseUrl = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${API_PORT}`;
};

const getForecasts = (lat: number, lon: number): Promise<Forecast[]> =>
  fetch(`${getBaseUrl()}/weather?lat=${lat}&lon=${lon}`).then(response => response.json());

const getForecastEventSource = (lat: number, lon: number): EventSource =>
  new EventSource(`${getBaseUrl()}/weather?lat=${lat}&lon=${lon}&sse=true`);

const eventResponseToCalendarEvent = (response: any) => ({
  ...response,
  from: new Date(response.from),
  to: new Date(response.to)
});
const getCalendarEventsByDates = (from: Date, to: Date): Promise<CalendarEvent[]> =>
  fetch(`${getBaseUrl()}/calendar?from=${from.toISOString()}&to=${to.toISOString()}`)
    .then(response => response.json())
    .then(events => events.map(eventResponseToCalendarEvent));

const getNextCalendarEvents = (next: number): Promise<CalendarEvent[]> =>
  fetch(`${getBaseUrl()}/calendar?next=${next}`)
    .then(response => response.json())
    .then(events => events.map(eventResponseToCalendarEvent));

const getNextCalendarEventsEventSource = (next: number): EventSource =>
  new EventSource(`${getBaseUrl()}/calendar?next=${next}&sse=true`);

const getIndoorTemperatures = (): Promise<Temperature[]> =>
  fetch(`${getBaseUrl()}/temperatures/indoor`).then(response => response.json());

const getHomeAlarmStatus = (): Promise<HomeAlarmInfo> =>
  fetch(`${getBaseUrl()}/homealarm/status`)
    .then(response => response.json())
    .then(info => ({
      ...info,
      time: new Date(info.time)
    }));

export default {
  getForecasts,
  getForecastEventSource,
  getCalendarEventsByDates,
  getNextCalendarEvents,
  getNextCalendarEventsEventSource,
  eventResponseToCalendarEvent,
  getIndoorTemperatures,
  getHomeAlarmStatus
};
