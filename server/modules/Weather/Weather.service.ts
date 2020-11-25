import config from '../../config';
import { Forecast, SunriseSunset } from '../../../shared/types';
import { getForecasts, getSunriseSunset } from '../../apis';

// Once a day
const SUNRISE_SUNSET_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

let sunriseSunset: SunriseSunset;
const sunriseSunsetLastUpdated = new Date(0);

const shouldRefreshSunriseSunset = () =>
  !sunriseSunset || Date.now() - sunriseSunsetLastUpdated.getTime() > SUNRISE_SUNSET_REFRESH_INTERVAL;

const getWeatherForecasts = async (): Promise<Forecast[]> => {
  const [lat, lon] = config.user.location!.split(',').map(coord => +coord);
  if (shouldRefreshSunriseSunset()) {
    return getSunriseSunset(lat, lon)
      .then(result => (sunriseSunset = result))
      .then(() => getForecasts(lat, lon, sunriseSunset));
  } else {
    return getForecasts(lat, lon, sunriseSunset);
  }
};

export default { getWeatherForecasts };
