import fetch from 'node-fetch';
import { SunriseSunset } from '../../shared/types';

type SunriseSunsetData = {
  results: {
    sunrise: string;
    sunset: string;
    day_length: number;
  };
  status: 'OK' | 'INVALID_REQUEST';
};

const BASE_URL = 'https://api.sunrise-sunset.org';

export const getSunriseSunset = (lat: number, lon: number): Promise<SunriseSunset> =>
  fetch(`${BASE_URL}/json?lat=${lat}&lng=${lon}&formatted=0`)
    .then(response => response.json())
    .then((data: SunriseSunsetData) => {
      if (data.status === 'OK') {
        return { sunrise: new Date(data.results.sunrise), sunset: new Date(data.results.sunset) };
      }
      throw data;
    })
    .catch(e => {
      // FIXME Return cache?
      throw e;
    });
