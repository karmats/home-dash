import express from 'express';
import { ExpressRequest } from '../models';
import { EventDataPollerService, EventDataHandler } from './EventDataPoller.service';
import { resultToSseData, heartbeatData, errorToSseData } from '../utils';

type Loggers<D> = {
  data: (data: D) => void;
  error: (error: any) => void;
};

export class PollHandler<R> {
  private pollerService: EventDataPollerService<R>;

  constructor(
    pollFunction: () => Promise<R>,
    interval: number,
    private readonly loggers?: Loggers<R>,
    requestWailt = 0
  ) {
    this.pollerService = new EventDataPollerService(pollFunction, interval, requestWailt);
  }

  unregisterPollerService(res: express.Response, req: ExpressRequest) {
    res.end();
    this.pollerService.finish(req.id);
  }

  registerPollerService = (res: express.Response, req: ExpressRequest) => {
    const handler: EventDataHandler<R> = this.createHandler(res, req);
    this.pollerService.registerHandler(handler);
  };

  private createHandler(res: express.Response, req: ExpressRequest): EventDataHandler<R> {
    return {
      id: req.id,
      data: result => {
        if (this.loggers) {
          this.loggers.data(result);
        }
        res.write(resultToSseData(result));
      },
      heartbeat: heartbeat => {
        res.write(heartbeatData(heartbeat.time));
      },
      error: err => {
        if (this.loggers) {
          this.loggers.error(err);
        }
        res.write(errorToSseData(err));
      },
    };
  }
}
