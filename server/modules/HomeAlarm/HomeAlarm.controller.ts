import express from 'express';
import HomeAlarmService from './HomeAlarm.service';
import { DEFAULT_HEADERS, SSE_HEADERS } from '../../utils';
import { HomeAlarmInfo } from '../../../shared/types';
import { getLogger } from '../../logger';
import { ExpressRequest } from '../../models';
import { PollHandler } from '../../services';

const logger = getLogger('HomeAlarmController');
// Every hour
const HOME_ALARM_REFRESH_INTERVAL = 60 * 60 * 1000;

let pollHandler: PollHandler<HomeAlarmInfo>;
const getHomeAlarmStatusInfo = (req: ExpressRequest<{ sse?: string }>, res: express.Response) => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with temperature data
    res.writeHead(200, SSE_HEADERS);

    if (!pollHandler) {
      const pollFn = () => HomeAlarmService.getAlarmStatus();
      pollHandler = new PollHandler(pollFn, HOME_ALARM_REFRESH_INTERVAL, {
        data: d => logger.debug(`Got alarm info status '${d.status}'`),
        error: err => logger.error(`Failed to get alarm info: ${JSON.stringify(err)}`),
      });
    }
    pollHandler.registerPollerService(res, req);

    req.on('close', () => pollHandler.unregisterPollerService(res, req));
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

export default { getHomeAlarmStatusInfo };
