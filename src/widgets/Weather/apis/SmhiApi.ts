import { Forecast, WeatherSymbol } from '../Weather.models';
import Weather from '../Weather';

type SmhiData = {
  approvedTime: string;
  geometry: { coordinates: number[] };
  type: string;
  referenceTime: string;
  timeSeries: SmhiDataTimeSerie[];
};
type SmhiDataTimeSerie = {
  validTime: string;
  parameters: SmhiDataParameter[];
};
type SmhiDataParameter = {
  name: string;
  levelType: string;
  level: number;
  unit: string;
  values: number[];
};

const smhiWsymb2ToWeatherSymbol = (wsymb: number): WeatherSymbol => {
  switch (wsymb) {
    case 1: // Clear sky
      return WeatherSymbol.CLEAR_SKY;
    case 2: // Nearly clear sky
      return WeatherSymbol.NEARLY_CLEAR_SKY;
    case 3: // Variable cloudiness
    case 4: // Halfclear sky
      return WeatherSymbol.HALFCLEAR_SKY;
    case 5: // Cloudy sky
      return WeatherSymbol.CLOUDY_SKY;
    case 6: // Overcast
    case 7: // Fog
      return WeatherSymbol.OVERCAST;
    case 8: // Light rain showers
      return WeatherSymbol.LIGHT_RAIN_SHOWERS;
    case 9: // Moderate rain showers
      return WeatherSymbol.MODERATE_RAIN_SHOWERS;
    case 10: // Heavy rain showers
      return WeatherSymbol.HEAVY_RAIN_SHOWERS;
    case 11: // Thunderstorm
    case 21: // Thunder
      return WeatherSymbol.THUNDER;
    case 12: // Light sleet showers
    case 15: // Light snow showers
      return WeatherSymbol.LIGHT_SNOW_SHOWERS;
    case 13: // Moderate sleet showers
    case 16: // Moderate snow showers
      return WeatherSymbol.MODERATE_SNOW_SHOWERS;
    case 14: // Heavy sleet showers
    case 17: // Heavy snow showers
      return WeatherSymbol.HEAVY_SNOW_SHOWERS;
    case 18: // Light rain
      return WeatherSymbol.LIGHT_RAIN;
    case 19: // Moderate rain
      return WeatherSymbol.MODERATE_RAIN;
    case 20: // Heavy rain
      return WeatherSymbol.HEAVY_RAIN;
    case 22: // Light sleet
    case 25: // Light snowfall
      return WeatherSymbol.LIGHT_SNOWFALL;
    case 23: //Moderate sleet
    case 26: // Moderate snowfall
      return WeatherSymbol.MODERATE_SNOWFALL;
    case 24: // Heavy sleet
    case 27: // Heavy snowfall
      return WeatherSymbol.HEAVY_SNOWFALL;
    default:
      console.log('Failed to find enum for', wsymb);
      return WeatherSymbol.HALFCLEAR_SKY;
  }
};

const smhiTimeSerieToForecast = (timeSerie: SmhiDataTimeSerie): Forecast => {
  const getParameterValue = (name: string): number =>
    (timeSerie.parameters.find(p => p.name === name) || { values: [] }).values[0];
  return {
    time: new Date(timeSerie.validTime),
    degrees: getParameterValue('t'),
    precipitation: getParameterValue('spp'),
    symbol: smhiWsymb2ToWeatherSymbol(getParameterValue('Wsymb2')),
    windSpeed: getParameterValue('ws'),
    windDirection: getParameterValue('wd')
  };
};

export const getForecast = async (lat: number, lon: number): Promise<Forecast[]> => {
  return fetch(
    `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(
      4
    )}/lat/${lat.toFixed(4)}/data.json`
  )
    .then(response => response.json())
    .then((data: SmhiData) => {
      return data.timeSeries.map(smhiTimeSerieToForecast);
    })
    .catch(e => {
      // FIXME Return cache?
      throw e;
    });
};
