import express from 'express';
import { TemperatureService } from '../../services';
import { DEFAULT_HEADERS, SSE_HEADERS, jsonToSseData } from '../../../../utils';

// Every other hour
const TEMPERATURES_REFRESH_INTERVAL = 2 * 60 * 60 * 1000;

const getIndoorTemperatures = (req: express.Request, res: express.Response) => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with temperature data
    res.writeHead(200, SSE_HEADERS);
    pollTemperatures(res);
    res.on('close', () => stopPollTemperatures());
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

let timer: any;
const pollTemperatures = (res: express.Response) => {
  const pollFn = (res: express.Response) => {
    TemperatureService.getIndoorTemperatures().then(
      temperatures => {
        res.write(jsonToSseData(temperatures));
      },
      err => {
        res.write(jsonToSseData(err));
      }
    );
  };
  timer = setInterval(pollFn, TEMPERATURES_REFRESH_INTERVAL, res);
  pollFn(res);
};

const stopPollTemperatures = () => clearInterval(timer);

export default { getIndoorTemperatures };
