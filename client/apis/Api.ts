import { Forecast } from '../../shared/types';

const API_PORT = 4000;

const getBaseUrl = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${API_PORT}`;
};

const getForecasts = (lat: number, lon: number): Promise<Forecast[]> =>
  fetch(`${getBaseUrl()}/weather?lat=${lat}&lon=${lon}`).then(response => response.json());

const getForecastEventSource = (lat: number, lon: number): EventSource =>
  new EventSource(`${getBaseUrl()}/weather?lat=${lat}&lon=${lon}&sse=true`);

export default {
  getForecasts,
  getForecastEventSource
};
