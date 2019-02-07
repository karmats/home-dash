import { Forecast, WeatherSymbol, WindDirection } from '../Weather.models';

export const getForecast = (lat: number, lon: number): Promise<Forecast> => {
  return fetch(
    `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(
      4
    )}/lat/${lat.toFixed(4)}/data.json`
  )
    .then(response => response.json())
    .then(forecast => {
      console.log(forecast);
      return {
        symbol: WeatherSymbol.CLEAR_SKY,
        degrees: 5,
        precipitation: 20,
        windDirection: WindDirection.E,
        windSpeed: 12,
        time: new Date()
      };
    })
    .catch(() => {
      return {
        symbol: WeatherSymbol.CLEAR_SKY,
        degrees: 5,
        precipitation: 20,
        windDirection: WindDirection.E,
        windSpeed: 12,
        time: new Date()
      };
    });
};
