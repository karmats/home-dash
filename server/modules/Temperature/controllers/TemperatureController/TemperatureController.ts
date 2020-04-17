import express from 'express';
import { TemperatureService } from '../../services';
import {
  DEFAULT_HEADERS,
  SSE_HEADERS,
  resultToSseData,
  errorToSseData,
  resultToHeartbeatData,
} from '../../../../utils';
import { EventDataPollerService, EventDataHandler } from '../../../../services/EventDataPollerService';
import { Temperature } from '../../../../../shared/types';

// Every other hour
const TEMPERATURES_REFRESH_INTERVAL = 2 * 60 * 60 * 1000;

const getIndoorTemperatures = (req: express.Request, res: express.Response) => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with temperature data
    res.writeHead(200, SSE_HEADERS);
    createAndStartPollerService(res);
    res.on('close', () => stopPollerService());
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

let pollerService: EventDataPollerService<Temperature[]>;
const createAndStartPollerService = (res: express.Response) => {
  const handler: EventDataHandler<Temperature[]> = {
    data: result => {
      res.write(resultToSseData(result));
    },
    heartbeat: heartbeat => {
      res.write(resultToHeartbeatData(heartbeat.time));
    },
    error: err => {
      res.write(errorToSseData(err));
    },
  };
  const pollFn = () => TemperatureService.getIndoorTemperatures();

  pollerService = new EventDataPollerService(pollFn, handler, TEMPERATURES_REFRESH_INTERVAL);
};

const stopPollerService = () => pollerService.finish();

export default { getIndoorTemperatures };
