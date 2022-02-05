import express from 'express';
import HomeAlarmService from './HomeAlarm.service';
import { DEFAULT_HEADERS, SSE_HEADERS } from '../../utils';
import { HomeAlarmInfo } from '../../../shared/types';
import { PollHandler } from '../../services';

// Every hour
const HOME_ALARM_REFRESH_INTERVAL = 60 * 60 * 1000;

let pollHandler: PollHandler<HomeAlarmInfo>;
const getHomeAlarmStatusInfo = (req: express.Request, res: express.Response): void => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with temperature data
    res.writeHead(200, SSE_HEADERS);

    if (!pollHandler) {
      const pollFn = () => HomeAlarmService.getAlarmStatus();
      pollHandler = new PollHandler(pollFn, HOME_ALARM_REFRESH_INTERVAL);
    }
    pollHandler.registerPollerService(res, req);

    req.on('close', () => pollHandler.unregisterPollerService(res, req));
  } else {
    res.writeHead(200, DEFAULT_HEADERS);
    HomeAlarmService.getAlarmStatus()
      .then(status => {
        if (pollHandler) {
          pollHandler.reportData(status);
        }
        res.write(JSON.stringify(status));
        res.end();
      })
      .catch(e => {
        res.write(JSON.stringify(e));
        res.end();
      });
  }
};

const toggleAlarm = (req: express.Request, res: express.Response): void => {
  res.writeHead(200, DEFAULT_HEADERS);
  HomeAlarmService.toggleAlarm()
    .then(status => {
      if (pollHandler) {
        pollHandler.reportData(status);
      }
      res.write(JSON.stringify(status));
      res.end();
    })
    .catch(e => {
      res.write(JSON.stringify(e));
      res.end();
    });
};

export default { getHomeAlarmStatusInfo, toggleAlarm };
