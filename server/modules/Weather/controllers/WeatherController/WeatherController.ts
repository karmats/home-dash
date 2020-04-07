import express from 'express';
import WeatherService from '../../services/WeatherService/WeatherService';
import {
  DEFAULT_HEADERS,
  SSE_HEADERS,
  resultToSseData,
  errorToSseData,
  resultToHeartbeatData,
} from '../../../../utils';
import { EventDataPollerService, EventDataHandler } from '../../../../services/EventDataPollerService';
import { Forecast } from '../../../../../shared/types';

// Every 20 minute
const FORECAST_REFRESH_INTERVAL = 20 * 60 * 1000;

const getForecastsFromRequest = (req: express.Request, res: express.Response) => {
  const { lat, lon, sse } = req.query;
  if (!lat || !lon) {
    res.writeHead(400);
    res.write('Parameters lat and lon needs to be supplied.');
    res.end();
  } else if (sse) {
    // Sse requested, keep connection open and feed with weather data
    res.writeHead(200, SSE_HEADERS);
    createAndStartPollerService(+lat, +lon, res);
    res.on('close', () => stopPollerService());
  } else {
    WeatherService.getWeatherForecasts(+lat, +lon)
      .then(forecasts => {
        res.writeHead(200, DEFAULT_HEADERS);
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

let pollerService: EventDataPollerService<Forecast[]>;
const createAndStartPollerService = (lat: number, lon: number, res: express.Response) => {
  const handler: EventDataHandler<Forecast[]> = {
    next: data => {
      const { result, heartbeat } = data;
      if (result) {
        res.write(resultToSseData(result));
      } else if (heartbeat) {
        res.write(resultToHeartbeatData(heartbeat.time));
      }
    },
    error: err => {
      res.write(errorToSseData(err));
    },
  };
  const pollFn = () => WeatherService.getWeatherForecasts(+lat, +lon);

  pollerService = new EventDataPollerService(pollFn, handler, FORECAST_REFRESH_INTERVAL);
};

const stopPollerService = () => pollerService.finish();

export default { getForecastsFromRequest, pollForecasts: createAndStartPollerService };
