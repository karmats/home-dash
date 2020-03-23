import express from 'express';
import { HomeAlarmService } from '../../services';
import { DEFAULT_HEADERS } from '../../../../utils';

const getHomeAlarmStatusInfo = (_: express.Request, res: express.Response) => {
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
};

export default { getHomeAlarmStatusInfo };
