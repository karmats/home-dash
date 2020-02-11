import express from 'express';
import { HomeAlarmService } from '../../services';
import { defaultHeaders } from '../../../../utils';

const getHomeAlarmStatusInfo = (_: express.Request, res: express.Response) => {
  res.writeHead(200, defaultHeaders);
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
