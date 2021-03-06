import express from 'express';
import { authenticateSectorAlarm } from '../../apis';
import { getLogger } from '../../logger';

const logger = getLogger('SectorAlarmAuthenticationController');

const authenticateToSectorAlarm = (req: express.Request, res: express.Response) => {
  authenticateSectorAlarm()
    .then(sessionMeta => {
      logger.debug(`Got session meta with version ${sessionMeta.version}`);
      res.write(JSON.stringify(sessionMeta));
      res.end();
    })
    .catch(e => {
      logger.error(`Got error for authentication to ${e}`);
      res.write(e);
      res.end();
    });
};

export default { authenticateToSectorAlarm };
