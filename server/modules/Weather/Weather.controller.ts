import express from 'express';
import WeatherService from './Weather.service';
import { DEFAULT_HEADERS, SSE_HEADERS } from '../../utils';
import { Forecast } from '../../../shared/types';
import { getLogger } from '../../logger';
import { ExpressRequest } from '../../models';
import { PollHandler } from '../../services';

const logger = getLogger('WeatherController');
// Every 20 minute
const FORECAST_REFRESH_INTERVAL = 20 * 60 * 1000;

let pollHandler: PollHandler<Forecast[]>;
const getForecastsFromRequest = (
  req: ExpressRequest<{ sse?: string }>,
  res: express.Response
) => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with weather data
    res.writeHead(200, SSE_HEADERS);

    if (!pollHandler) {
      const pollFn = () => WeatherService.getWeatherForecasts();
      pollHandler = new PollHandler(pollFn, FORECAST_REFRESH_INTERVAL, {
        data: d => logger.debug(`Got ${d.length} forecasts`),
        error: err => logger.error(`Failed to get forecasts: ${JSON.stringify(err)}`),
      });
    }
    pollHandler.registerPollerService(res, req);

    req.on('close', () => pollHandler.unregisterPollerService(res, req));
  } else {
    WeatherService.getWeatherForecasts()
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

export default { getForecastsFromRequest };
