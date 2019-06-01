import { Forecast, SunriseSunset } from '../../shared/types/Weather.models';
import { getForecasts, getSunriseSunset } from '../apis';

// Once a day
const SUNRISE_SUNSET_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

let sunriseSunset: SunriseSunset;
let sunriseSunsetLastUpdated = new Date(0);

const shouldRefreshSunriseSunset = () =>
  !sunriseSunset || Date.now() - sunriseSunsetLastUpdated.getTime() > SUNRISE_SUNSET_REFRESH_INTERVAL;

export const getWeatherForecasts = async (lat: number, lon: number): Promise<Forecast[]> => {
  if (shouldRefreshSunriseSunset()) {
    return getSunriseSunset(lat, lon)
      .then(result => (sunriseSunset = result))
      .then(() => getForecasts(lat, lon, sunriseSunset));
  }
  return getForecasts(lat, lon, sunriseSunset);
};
