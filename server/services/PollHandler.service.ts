import express from 'express';
import { EventDataPollerService, EventDataHandler } from './EventDataPoller.service';
import { resultToSseData, heartbeatData, errorToSseData } from '../utils';
import { getLogger } from '../logger';

const logger = getLogger('PollHandler');

export class PollHandler<R> {
  private pollerService: EventDataPollerService<R>;

  constructor(pollFunction: () => Promise<R>, interval: number, requestWailt = 0) {
    this.pollerService = new EventDataPollerService(pollFunction, interval, requestWailt);
  }

  unregisterPollerService(res: express.Response, req: express.Request): void {
    logger.debug(`Unregistering listener with ip '${req.ip}' and id '${req['id']}'.`);
    res.end();
    this.pollerService.finish(req['id']);
  }

  registerPollerService = (res: express.Response, req: express.Request): void => {
    logger.debug(`Registering new listener with ip '${req.ip}' and id '${req['id']}'.`);
    const handler: EventDataHandler<R> = this.createHandler(res, req);
    this.pollerService.registerHandler(handler);
  };

  reportData(data: R): void {
    this.pollerService.reportData(data);
  }

  private createHandler(res: express.Response, req: express.Request): EventDataHandler<R> {
    return {
      id: req['id'],
      data: result => {
        res.write(resultToSseData(result));
      },
      heartbeat: heartbeat => {
        res.write(heartbeatData(heartbeat.time));
      },
      error: err => {
        res.write(errorToSseData(err));
      },
    };
  }
}
