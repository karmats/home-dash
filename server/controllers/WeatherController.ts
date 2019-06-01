import express from 'express';
import { getWeatherForecasts } from '../services';
import { defaultHeaders } from '../utils';

// Every 5 minute
const FORECAST_REFRESH_INTERVAL = 5 * 60 * 60 * 1000;

export const getForecasts = (lat: number, lon: number) => getWeatherForecasts(lat, lon);

export const getForecastsFromRequest = function(req: express.Request, res: express.Response) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    res.writeHead(400);
    res.write(`Parameters lat and lon needs to be supplied. Supplied lat: ${lat}, lon: ${lon}`);
    res.end();
  } else {
    getWeatherForecasts(+lat, +lon)
      .then(forecasts => {
        res.writeHead(200, defaultHeaders);
        res.write(JSON.stringify(forecasts));
        res.end();
      })
      .catch(e => {
        console.error(e);
        res.writeHead(500);
        res.write(JSON.stringify(e));
        res.end();
      });
  }
};

let intervalId = -1;
export const pollForecasts = (lat: number, lon: number) => {
  intervalId = setInterval(getForecasts, FORECAST_REFRESH_INTERVAL, lat, lon);
};

export const stopPollForecast = () => clearInterval(intervalId);
