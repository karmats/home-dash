import express from 'express';
import { TemperatureService } from '../../services';
import { defaultHeaders } from '../../../../utils';

const getIndoorTemperatures = (_: express.Request, res: express.Response) => {
  TemperatureService.getIndoorTemperatures()
    .then(temperatures => {
      res.writeHead(200, defaultHeaders);
      res.write(JSON.stringify(temperatures));
      res.end();
    })
    .catch(e => {
      res.writeHead(500, defaultHeaders);
      res.write(JSON.stringify(e));
      res.end();
    });
};

export default { getIndoorTemperatures };
