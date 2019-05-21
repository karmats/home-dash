import React, { useEffect, useState, useReducer } from 'react';
import ReactSVG from 'react-svg';
import { getLocation } from '../../App.service';
import { Location } from '../../models';
import * as forecastApi from './apis/SmhiApi';
import * as sunriseSunsetApi from './apis/SunriseSunsetApi';
import * as util from './Weather.utils';
import './Weather.css';
import { Forecast, SunriseSunset } from './Weather.models';

// Every 5 minute
const FORECAST_REFRESH_INTERVAL = 5 * 60 * 60 * 1000;
// Once a day
const SUNRISE_SUNSET_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;
// Every 30 second
const TIME_REFRESH_INTERVAL = 30 * 1000;

type WeatherProps = {
  forecast: Forecast;
};

const MainWeather = ({ forecast }: WeatherProps) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const updateNow = () => setNow(new Date());
    const timeInterval = window.setInterval(updateNow, TIME_REFRESH_INTERVAL);
    return () => {
      clearInterval(timeInterval);
    };
  }, [now]);
  return (
    <div className="Weather-main">
      <p className="Weather-main--strong">{util.dateToTime(now)}</p>
      <ReactSVG svgClassName="Weather-main__svg" src={require(`./svgs/animated/${forecast.symbol}.svg`)} />
      <div>
        <p className="Weather-main--strong">{forecast.degrees.toFixed(0)}°</p>
        <div className="Weather-main--weak">
          <ReactSVG
            svgStyle={{ transform: `rotate(${forecast.windDirection}deg)` }}
            src={require('./svgs/static/wind.svg')}
            wrapper="span"
          />
          <span>{`${forecast.windSpeed.toFixed(0)} m/s`}</span>
          <ReactSVG src={require('./svgs/static/precipitation.svg')} wrapper="span" />
          <span>{`${forecast.precipitation} mm/h`}</span>
        </div>
      </div>
    </div>
  );
};
const CommingWeather = ({ forecast }: WeatherProps) => (
  <div className="Weather-comming">
    <ReactSVG src={require(`./svgs/static/${forecast.symbol}.svg`)} />
    <p>{util.dateToTime(forecast.time)}</p>
    <p>{forecast.degrees.toFixed(0)}°</p>
    <div className="Weather-comming--weak">
      <ReactSVG
        svgStyle={{ transform: `rotate(${forecast.windDirection}deg)` }}
        src={require('./svgs/static/wind.svg')}
        wrapper="span"
      />
      <span>{`${forecast.windSpeed.toFixed(0)} m/s`}</span>
      <br />
      <ReactSVG src={require('./svgs/static/precipitation.svg')} wrapper="span" />
      <span>{`${forecast.precipitation} mm/h`}</span>
    </div>
  </div>
);

type WeatherState = {
  forecasts: Forecast[];
  sunriseSunset: SunriseSunset | null;
  sunriseSunsetLastUpdated: Date;
};

type ForecastAction = {
  type: 'FORECASTS_UPDATE';
  data: Forecast[];
};

type SunriseSunsetAction = {
  type: 'SUNRISE_SUNSET_UPDATE';
  data: SunriseSunset;
};

const weatherReducer: React.Reducer<WeatherState, ForecastAction | SunriseSunsetAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case 'FORECASTS_UPDATE':
      return { ...state, forecasts: action.data };
    case 'SUNRISE_SUNSET_UPDATE':
      return { ...state, sunriseSunset: action.data, sunriseSunsetLastUpdated: new Date() };
    default:
      return state;
  }
};

const initialState: WeatherState = {
  forecasts: [],
  sunriseSunset: null,
  sunriseSunsetLastUpdated: new Date(0)
};

export default function() {
  const [state, dispatch] = useReducer<React.Reducer<WeatherState, ForecastAction | SunriseSunsetAction>>(
    weatherReducer,
    initialState
  );

  useEffect(() => {
    const fetchSunriseSunset = async (location: Location) => {
      const sunriseSunset = await sunriseSunsetApi.getSunriseSunset(location.lat, location.lon);
      dispatch({ type: 'SUNRISE_SUNSET_UPDATE', data: sunriseSunset });
      return sunriseSunset;
    };
    const fetchForecast = async () => {
      const location = await getLocation();
      let currentSunriseSunset = state.sunriseSunset;
      if (
        !currentSunriseSunset ||
        new Date().getTime() - state.sunriseSunsetLastUpdated.getTime() > SUNRISE_SUNSET_REFRESH_INTERVAL
      ) {
        currentSunriseSunset = await fetchSunriseSunset(location);
      }
      const forecasts = await forecastApi.getForecasts(location.lat, location.lon, currentSunriseSunset);
      dispatch({ type: 'FORECASTS_UPDATE', data: forecasts });
    };
    const fetchForecastInterval = window.setInterval(fetchForecast, FORECAST_REFRESH_INTERVAL);
    fetchForecast();
    return () => {
      window.clearInterval(fetchForecastInterval);
    };
  }, [state.sunriseSunset, state.sunriseSunsetLastUpdated]);
  return (
    <div>
      {state.forecasts.length ? (
        <>
          <MainWeather forecast={state.forecasts[0]} />
          <div className="Weather-footer">
            <CommingWeather forecast={state.forecasts[2]} />
            <CommingWeather forecast={state.forecasts[4]} />
            <CommingWeather forecast={state.forecasts[6]} />
            <CommingWeather forecast={state.forecasts[8]} />
          </div>
        </>
      ) : (
        <span>Fetching weather data...</span>
      )}
    </div>
  );
}
