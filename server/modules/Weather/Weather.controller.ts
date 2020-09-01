import express from 'express';
import WeatherService from './Weather.service';
import { DEFAULT_HEADERS, SSE_HEADERS, resultToSseData, errorToSseData, heartbeatData } from '../../utils';
import { EventDataPollerService, EventDataHandler } from '../../services/EventDataPoller.service';
import { Forecast } from '../../../shared/types';
import { getLogger } from '../../logger';

const logger = getLogger('WeatherController');
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
    req.on('close', () => stopPollerService());
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
    data: result => {
      logger.debug(`Got ${result.length} forecasts`);
      res.write(resultToSseData(result));
    },
    heartbeat: heartbeat => {
      res.write(heartbeatData(heartbeat.time));
    },
    error: err => {
      logger.error(`Failed to get forecasts: ${JSON.stringify(err)}`);
      res.write(errorToSseData(err));
    },
  };
  const pollFn = () => WeatherService.getWeatherForecasts(+lat, +lon);

  pollerService = new EventDataPollerService(pollFn, handler, FORECAST_REFRESH_INTERVAL);
};

const stopPollerService = () => {
  logger.debug('Closing weather polling..');
  pollerService.finish();
};

export default { getForecastsFromRequest };