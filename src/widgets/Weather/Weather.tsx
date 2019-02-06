import React, { useEffect, useState } from 'react';
import * as api from './apis/SmhiApi';
import './Weather.css';
import { WeatherSymbol, Forecast } from './Weather.models';

export type WeatherProps = {
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
  const [currentWeather, setCurrentWeather] = useState<Forecast | null>(null);

  useEffect(() => {
    api.getForecast().then(forecast => setCurrentWeather(forecast));
  });
  return (
    currentWeather && (
      <div>
        <MainWeather type={currentWeather.symbol} degrees={currentWeather.degrees} />
        <div className="Weather-footer">
          <CommingWeather type={WeatherSymbol.SUNNY} degrees={3} />
          <CommingWeather type={WeatherSymbol.SNOWY} degrees={12} />
          <CommingWeather type={WeatherSymbol.SUNNY} degrees={-1} />
        </div>
      </div>
    )
  );
};
