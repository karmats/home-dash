import React from 'react';
import sunnyAnimated from './svgs/animated/day.svg';
import sunny from './svgs/static/day.svg';
import './WeatherWidget.css';

export default () => (
  <div>
    <img className="WeatherWidget-svg" src={sunnyAnimated} />
    <p className="WeatherWidget-desc">15°</p>
    <div className="WeaterWidget-footer">
      <div>
        <img src={sunny} />
        <p>12°</p>
      </div>
      <div>
        <img src={sunny} />
        <p>12°</p>
      </div>
      <div>
        <img src={sunny} />
        <p>12°</p>
      </div>
    </div>
  </div>
);
