import { Forecast, WeatherSymbol, WindDirection } from '../Weather.models';

export const getForecast = (): Promise<Forecast> => {
  return Promise.resolve({
    symbol: WeatherSymbol.SUNNY,
    degrees: 5,
    precipitation: 20,
    windDirection: WindDirection.E,
    windSpeed: 12,
    time: new Date()
  });
};
