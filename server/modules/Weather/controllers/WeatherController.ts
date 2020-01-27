import express from 'express';
import WeatherService from '../services/WeatherService/WeatherService';
import { defaultHeaders } from '../../../utils';

// Every 5 minute
const FORECAST_REFRESH_INTERVAL = 5 * 60 * 1000;

const getForecastsFromRequest = (req: express.Request, res: express.Response) => {
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
    WeatherService.getWeatherForecasts(+lat, +lon)
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
const pollForecasts = (lat: number, lon: number, res: express.Response) => {
  const pollFn = (lat: number, lon: number, res: express.Response) => {
    WeatherService.getWeatherForecasts(+lat, +lon).then(forecasts => {
      res.write(`data:${JSON.stringify(forecasts)}\n\n`);
    });
  };
  timer = setInterval(pollFn, FORECAST_REFRESH_INTERVAL, lat, lon, res);
  pollFn(lat, lon, res);
};

const stopPollForecast = () => clearInterval(timer);

export default { getForecastsFromRequest, pollForecasts, stopPollForecast };
