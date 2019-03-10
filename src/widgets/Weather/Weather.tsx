import React, { useEffect, useState } from 'react';
import ReactSVG from 'react-svg';
import { getUser } from '../../UserService';
import * as api from './apis/SmhiApi';
import * as util from './Weather.utils';
import './Weather.css';
import { Forecast } from './Weather.models';

// Every 5 minute
const FETCH_FORECAST_POLLING_INTERVAL = 5 * 60 * 60 * 1000;
// Every 30 second
const UPDATE_TIME_POLLING_INTERVAL = 30 * 1000;

type WeatherProps = {
  forecast: Forecast;
};

const MainWeather = ({ forecast }: WeatherProps) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const updateNow = () => setNow(new Date());
    const timeInterval = window.setInterval(updateNow, UPDATE_TIME_POLLING_INTERVAL);
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
      <span>{`${forecast.windSpeed.toFixed(0)} m/s`}</span><br />
      <ReactSVG src={require('./svgs/static/precipitation.svg')} wrapper="span" />
      <span>{`${forecast.precipitation} mm/h`}</span>
    </div>
  </div>
);

export default () => {
  const [currentForecasts, setCurrentForecasts] = useState<Forecast[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      const user = getUser();
      if (user) {
        const forecast = await api.getForecasts(user.lat, user.lon);
        setCurrentForecasts(forecast);
      }
    };
    const fetchInterval = window.setInterval(fetchForecast, FETCH_FORECAST_POLLING_INTERVAL);
    fetchForecast();
    return () => {
      window.clearInterval(fetchInterval);
    };
  }, []);
  return (
    <>
      {currentForecasts.length && (
        <div>
          <MainWeather forecast={currentForecasts[0]} />
          <div className="Weather-footer">
            <CommingWeather forecast={currentForecasts[3]} />
            <CommingWeather forecast={currentForecasts[6]} />
            <CommingWeather forecast={currentForecasts[9]} />
            <CommingWeather forecast={currentForecasts[12]} />
          </div>
        </div>
      )}
    </>
  );
};
