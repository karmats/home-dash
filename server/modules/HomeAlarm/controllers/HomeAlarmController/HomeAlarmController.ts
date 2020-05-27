import express from 'express';
import { HomeAlarmService } from '../../services';
import {
  DEFAULT_HEADERS,
  resultToSseData,
  resultToHeartbeatData,
  errorToSseData,
  SSE_HEADERS,
} from '../../../../utils';
import { EventDataPollerService, EventDataHandler } from '../../../../services/EventDataPollerService';
import { HomeAlarmInfo } from '../../../../../shared/types';
import { getLogger } from '../../../../logger';

const logger = getLogger('HomeAlarmController');
// Every hour
const HOME_ALARM_REFRESH_INTERVAL = 60 * 60 * 1000;

const getHomeAlarmStatusInfo = (req: express.Request, res: express.Response) => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with temperature data
    res.writeHead(200, SSE_HEADERS);
    createAndStartPollerService(res);
    res.on('close', () => stopPollerService());
  } else {
    res.writeHead(200, DEFAULT_HEADERS);
    HomeAlarmService.getAlarmStatus()
      .then(status => {
        res.write(JSON.stringify(status));
        res.end();
      })
      .catch(e => {
        res.write(JSON.stringify(e));
        res.end();
      });
  }
};

let pollerService: EventDataPollerService<HomeAlarmInfo>;
const createAndStartPollerService = (res: express.Response) => {
  const handler: EventDataHandler<HomeAlarmInfo> = {
    data: result => {
      logger.debug(`Got alarm info status '${result.status}'`);
      res.write(resultToSseData(result));
    },
    heartbeat: heartbeat => {
      res.write(resultToHeartbeatData(heartbeat.time));
    },
    error: err => {
      logger.error(`Failed to get alarm info: ${JSON.stringify(err)}`);
      res.write(errorToSseData(err));
    },
  };
  const pollFn = () => HomeAlarmService.getAlarmStatus();

  pollerService = new EventDataPollerService(pollFn, handler, HOME_ALARM_REFRESH_INTERVAL);
};

const stopPollerService = () => pollerService.finish();

export default { getHomeAlarmStatusInfo };
