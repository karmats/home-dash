import { SunriseSunset } from '../Weather.models';

type SunriseSunsetData = {
  results: {
    sunrise: string;
    sunset: string;
    day_length: number;
  };
  status: 'OK' | 'INVALID_REQUEST';
};

export const getSunriseSunset = (lat: number, lon: number): Promise<SunriseSunset> =>
  fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`)
    .then(response => response.json())
    .then((data: SunriseSunsetData) => ({
      sunrise: new Date(data.results.sunrise),
      sunset: new Date(data.results.sunset)
    }))
    .catch(e => {
      // FIXME Return cache?
      throw e;
    });
