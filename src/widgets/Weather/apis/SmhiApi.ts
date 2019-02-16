import { Forecast, WeatherSymbol } from '../Weather.models';

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

const smhiWsymb2ToWeatherSymbol = (wsymb: number): string => Object.keys(WeatherSymbol)[wsymb];

const smhiTimeSerieToForecast = (timeSerie: SmhiDataTimeSerie): Forecast => {
  const getParameterValue = (name: string): number =>
    (timeSerie.parameters.find(p => p.name === name) || { values: [] }).values[0];
  return {
    time: new Date(timeSerie.validTime),
    degrees: getParameterValue('t'),
    precipitation: getParameterValue('spp'),
    symbol: WeatherSymbol[smhiWsymb2ToWeatherSymbol(getParameterValue('Wsymb2')) as any] as WeatherSymbol,
    windSpeed: getParameterValue('ws'),
    windDirection: getParameterValue('wd')
  };
};

export const getForecast = async (lat: number, lon: number): Promise<Forecast> => {
  return fetch(
    `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon.toFixed(
      4
    )}/lat/${lat.toFixed(4)}/data.json`
  )
    .then(response => response.json())
    .then((data: SmhiData) => {
      const forecast = smhiTimeSerieToForecast(data.timeSeries[0]);
      console.log(data, forecast);
      return forecast;
    })
    .catch(() => {
      return {
        symbol: WeatherSymbol.CLEAR_SKY,
        degrees: 5,
        precipitation: 20,
        windDirection: 90,
        windSpeed: 12,
        time: new Date()
      };
    });
};
