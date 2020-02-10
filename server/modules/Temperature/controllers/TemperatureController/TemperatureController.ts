import express from 'express';
import { TemperatureService } from '../../services';
import { defaultHeaders } from '../../../../utils';

const getIndoorTemperatures = (_: express.Request, res: express.Response) => {
  res.writeHead(200, defaultHeaders);
  TemperatureService.getIndoorTemperatures()
    .then(temperatures => {
      res.write(JSON.stringify(temperatures));
      res.end();
    })
    .catch(e => {
      res.write(JSON.stringify(e));
      res.end();
    });
};

export default { getIndoorTemperatures };
