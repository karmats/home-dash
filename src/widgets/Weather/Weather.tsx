import React from 'react';
import './Weather.css';
import { WeatherData, WeatherType, WindDirection } from './Weather.models';

export type WeatherProps = {
  type: WeatherType;
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
  const currentWeather: WeatherData = {
    type: WeatherType.SUNNY,
    degrees: 5,
    precipitation: 20,
    windDirection: WindDirection.E,
    windSpeed: 12,
    time: new Date()
  };
  return (
    <div>
      <MainWeather type={currentWeather.type} degrees={currentWeather.degrees} />
      <div className="Weather-footer">
        <CommingWeather type={WeatherType.SUNNY} degrees={3} />
        <CommingWeather type={WeatherType.SNOWY} degrees={12} />
        <CommingWeather type={WeatherType.SUNNY} degrees={-1} />
      </div>
    </div>
  );
};
