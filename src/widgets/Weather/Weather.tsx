import React, { useEffect, useState } from 'react';
import { getUser } from '../../UserService';
import * as api from './apis/SmhiApi';
import * as util from './Weather.utils';
import './Weather.css';
import { WeatherSymbol, Forecast } from './Weather.models';

// Every 5 minute
const POLLING_INTERVAL = 5 * 60 * 60 * 1000;

type WeatherProps = {
  forecast: Forecast;
};

const MainWeather = ({ forecast }: WeatherProps) => {
  const imgSrc = require(`./svgs/animated/${forecast.symbol}.svg`);
  return (
    <div>
      <img className="Weather-main-svg" src={imgSrc} />
      <p className="Weather-main-desc">{`${forecast.degrees.toFixed(0)}° (${util.dateToTime(forecast.time)})`}</p>
    </div>
  );
};
const CommingWeather = ({ forecast }: WeatherProps) => {
  const imgSrc = require(`./svgs/static/${forecast.symbol}.svg`);
  return (
    <div>
      <img src={imgSrc} />
      <p>{`${forecast.degrees.toFixed(0)}° (${util.dateToTime(forecast.time)})`}</p>
    </div>
  );
};

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
    window.setInterval(fetchForecast, POLLING_INTERVAL);
    fetchForecast();
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
          </div>
        </div>
      )}
    </>
  );
};
