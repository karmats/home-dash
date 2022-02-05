import express from 'express';
import TemperatureService from './Temperature.service';
import { DEFAULT_HEADERS, SSE_HEADERS } from '../../utils';
import { Temperature } from '../../../shared/types';
import { PollHandler } from '../../services';

// Every other hour
const TEMPERATURES_REFRESH_INTERVAL = 2 * 60 * 60 * 1000;
// Wait 5 seconds until first request, so the alarm status can authenticate first
const REQUEST_WAIT = 5 * 1000;

let pollHandler: PollHandler<Temperature[]>;
const getIndoorTemperatures = (req: express.Request<{ sse?: string }>, res: express.Response): void => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with temperature data
    res.writeHead(200, SSE_HEADERS);

    if (!pollHandler) {
      const pollFn = () => TemperatureService.getIndoorTemperatures();
      pollHandler = new PollHandler(pollFn, TEMPERATURES_REFRESH_INTERVAL, REQUEST_WAIT);
    }
    pollHandler.registerPollerService(res, req);

    req.on('close', () => pollHandler.unregisterPollerService(res, req));
  } else {
    TemperatureService.getIndoorTemperatures()
      .then(temperatures => {
        if (pollHandler) {
          pollHandler.reportData(temperatures);
        }
        res.writeHead(200, DEFAULT_HEADERS);
        res.write(JSON.stringify(temperatures));
        res.end();
      })
      .catch(e => {
        res.writeHead(500, DEFAULT_HEADERS);
        res.write(JSON.stringify(e));
        res.end();
      });
  }
};

export default { getIndoorTemperatures };
