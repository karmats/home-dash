import express from 'express';
import { authenticate } from '../../../../apis/SectorAlarmApi';

const authenticateToSectorAlarm = (req: express.Request, res: express.Response) => {
  authenticate()
    .then(sessionMeta => {
      res.write(JSON.stringify(sessionMeta));
      res.end();
    })
    .catch(e => {
      res.write(e);
      res.end();
    });
};

export default { authenticateToSectorAlarm };
