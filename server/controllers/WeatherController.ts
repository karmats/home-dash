import express from 'express';
import { getWeatherForecasts } from '../services';
import { defaultHeaders } from '../utils';

// Every 5 minute
const FORECAST_REFRESH_INTERVAL = 5 * 60 * 1000;

export const getForecastsFromRequest = function(req: express.Request, res: express.Response) {
  const { lat, lon, sse } = req.query;
  if (!lat || !lon) {
    res.writeHead(400);
    res.write('Parameters lat and lon needs to be supplied.');
    res.end();
  } else if (sse) {
    // Sse requested, keep connection open and feed with weather data
    res.writeHead(200, {
      ...defaultHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    pollForecasts(+lat, +lon, res);
    res.on('close', () => stopPollForecast());
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

let timer: any;
export const pollForecasts = (lat: number, lon: number, res: express.Response) => {
  const pollFn = (lat: number, lon: number, res: express.Response) => {
    getWeatherForecasts(+lat, +lon).then(forecasts => {
      res.write(`data:${JSON.stringify(forecasts)}\n\n`);
    });
  };
  timer = setInterval(pollFn, FORECAST_REFRESH_INTERVAL, lat, lon, res);
  pollFn(lat, lon, res);
};

export const stopPollForecast = () => clearInterval(timer);
