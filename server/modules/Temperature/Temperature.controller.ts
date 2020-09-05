import express from 'express';
import TemperatureService from './Temperature.service';
import { DEFAULT_HEADERS, SSE_HEADERS } from '../../utils';
import { Temperature } from '../../../shared/types';
import { getLogger } from '../../logger';
import { PollHandler } from '../../services';
import { ExpressRequest } from '../../models';

const logger = getLogger('TemperatureController');
// Every other hour
const TEMPERATURES_REFRESH_INTERVAL = 2 * 60 * 60 * 1000;
// Wait 5 seconds until first request, so the alarm status can authenticate first
const REQUEST_WAIT = 5 * 1000;

let pollHandler: PollHandler<Temperature[]>;
const getIndoorTemperatures = (req: ExpressRequest<{ sse?: string }>, res: express.Response) => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with temperature data
    res.writeHead(200, SSE_HEADERS);

    if (!pollHandler) {
      const pollFn = () => TemperatureService.getIndoorTemperatures();
      pollHandler = new PollHandler(
        pollFn,
        TEMPERATURES_REFRESH_INTERVAL,
        {
          data: d => logger.debug(`Got ${d.length} temperatures`),
          error: err => logger.error(`Failed to fetch temperatures: ${JSON.stringify(err)}`),
        },
        REQUEST_WAIT
      );
    }
    pollHandler.registerPollerService(res, req);

    req.on('close', () => pollHandler.unregisterPollerService(res, req));
  } else {
    TemperatureService.getIndoorTemperatures()
      .then(temperatures => {
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
