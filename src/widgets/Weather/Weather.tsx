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
  const [currentForecast, setCurrentForecast] = useState<Forecast | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      const user = getUser();
      if (user) {
        const forecast = await api.getForecast(user.lat, user.lon);
        setCurrentForecast(forecast);
      }
    };
    window.setInterval(fetchForecast, POLLING_INTERVAL);
    fetchForecast();
  }, []);
  return (
    currentForecast && (
      <div>
        <MainWeather type={currentForecast.symbol} degrees={currentForecast.degrees} />
        <div className="Weather-footer">
          <CommingWeather type={WeatherSymbol.CLEAR_SKY} degrees={3} />
          <CommingWeather type={WeatherSymbol.HEAVY_SNOWFALL} degrees={12} />
          <CommingWeather type={WeatherSymbol.HEAVY_SNOWFALL} degrees={-1} />
        </div>
      </div>
    )
  );
};
