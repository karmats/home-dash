import React, { useEffect, useState } from 'react';
import { User } from '../../models';
import { getUser } from '../../UserService';
import * as api from './apis/SmhiApi';
import './Weather.css';
import { WeatherSymbol, Forecast } from './Weather.models';

// Every 5 minute
const POLLING_INTERVAL = 5 * 60 * 60 * 1000;

type WeatherProps = {
  type: WeatherSymbol;
  degrees: number;
};

const MainWeather = ({ type, degrees }: WeatherProps) => {
  const imgSrc = require(`./svgs/animated/${type}.svg`);
  return (
    <div>
      <img className="Weather-main-svg" src={imgSrc} />
      <p className="Weather-main-desc">{degrees}°</p>
    </div>
  );
};
const CommingWeather = ({ type, degrees }: WeatherProps) => {
  const imgSrc = require(`./svgs/static/${type}.svg`);
  return (
    <div>
      <img src={imgSrc} />
      <p>{degrees}°</p>
    </div>
  );
};

export default () => {
  const [currentForecasts, setCurrentForecasts] = useState<Forecast[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      const user = getUser();
      if (user) {
        const forecast = await api.getForecast(user.lat, user.lon);
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
          <MainWeather type={currentForecasts[0].symbol} degrees={currentForecasts[0].degrees} />
          <div className="Weather-footer">
            <CommingWeather type={currentForecasts[1].symbol} degrees={currentForecasts[1].degrees} />
            <CommingWeather type={currentForecasts[2].symbol} degrees={currentForecasts[2].degrees} />
            <CommingWeather type={currentForecasts[3].symbol} degrees={currentForecasts[3].degrees} />
          </div>
        </div>
      )}
    </>
  );
};
