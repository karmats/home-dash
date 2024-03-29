import { Forecast, CalendarEvent, Temperature, HomeAlarmInfo, News } from '../../shared/types';

const API_PORT = 4000;

const getBaseUrl = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${API_PORT}`;
};

const getForecasts = (): Promise<Forecast[]> => fetch(`${getBaseUrl()}/weather`).then(response => response.json());

const getForecastEventSource = (): EventSource => new EventSource(`${getBaseUrl()}/weather?sse=true`);

const getCalendarEventsByDates = (from: Date, to: Date): Promise<CalendarEvent[]> =>
  fetch(`${getBaseUrl()}/calendar?from=${from.toISOString()}&to=${to.toISOString()}`).then(response => response.json());

const getNextCalendarEvents = (next: number): Promise<CalendarEvent[]> =>
  fetch(`${getBaseUrl()}/calendar?next=${next}`).then(response => response.json());

const getNextCalendarEventsEventSource = (next: number): EventSource =>
  new EventSource(`${getBaseUrl()}/calendar?next=${next}&sse=true`);

const getIndoorTemperatures = (): Promise<Temperature[]> =>
  fetch(`${getBaseUrl()}/temperatures/indoor`).then(response => response.json());

const getIndoorTemperaturesEventSource = (): EventSource =>
  new EventSource(`${getBaseUrl()}/temperatures/indoor?sse=true`);

const getHomeAlarmStatus = (): Promise<HomeAlarmInfo> =>
  fetch(`${getBaseUrl()}/homealarm/status`)
    .then(response => response.json())
    .then(info => ({
      ...info,
      time: new Date(info.time),
    }));

const getHomeAlarmStatusEventSource = (): EventSource => new EventSource(`${getBaseUrl()}/homealarm/status?sse=true`);

const postToggleAlarmStatus = (): Promise<HomeAlarmInfo> =>
  fetch(`${getBaseUrl()}/homealarm/toggle`, { method: 'POST' }).then(response => response.json());

const getLatestNews = (): Promise<News> => fetch(`${getBaseUrl()}/news`).then(response => response.json());

const getLatestNewsEventSource = (): EventSource => new EventSource(`${getBaseUrl()}/news?sse=true`);

export default {
  getForecasts,
  getForecastEventSource,
  getCalendarEventsByDates,
  getNextCalendarEvents,
  getNextCalendarEventsEventSource,
  getIndoorTemperatures,
  getIndoorTemperaturesEventSource,
  getHomeAlarmStatus,
  getHomeAlarmStatusEventSource,
  postToggleAlarmStatus,
  getLatestNews,
  getLatestNewsEventSource,
};
