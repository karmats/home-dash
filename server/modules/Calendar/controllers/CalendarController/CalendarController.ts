import express from 'express';
import CalendarService from '../../services/CalendarService';
import { AuthenticationService } from '../../../Authentication';
import {
  DEFAULT_HEADERS,
  SSE_HEADERS,
  resultToSseData,
  errorToSseData,
  resultToHeartbeatData,
} from '../../../../utils';
import { EventDataHandler, EventDataPollerService } from '../../../../services/EventDataPollerService';
import { CalendarEvent } from '../../../../../shared/types';

// Every hour
const CALENDAR_REFRESH_INTERVAL = 60 * 60 * 1000;
const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;

const getCalendarEventsFromRequest = (req: express.Request, res: express.Response) => {
  const { from, to, next, sse } = req.query;
  if ((next && !isNaN(next)) || (from && DATE_REGEX.test(from) && to && DATE_REGEX.test(to))) {
    const dateFrom = from ? new Date(from) : null;
    if (dateFrom) {
      dateFrom.setHours(0);
      dateFrom.setMinutes(0);
      dateFrom.setMilliseconds(0);
    }
    const dateTo = to ? new Date(to) : to;
    if (dateTo) {
      dateTo.setHours(23);
      dateTo.setMinutes(59);
    }
    const comming = next ? +next : null;

    AuthenticationService.isConnectedToGoogle().then(ready => {
      if (ready) {
        if (sse && comming) {
          // Sse requested, keep connection open and feed with calendar event data
          res.writeHead(200, SSE_HEADERS);
          createAndStartPollerService(comming, res);
          res.on('close', () => stopPollerService());
        } else {
          const request = comming
            ? CalendarService.getNextCalendarEvents(comming)
            : CalendarService.getCalendarEventsByDates(dateFrom!, dateTo!);
          request.then(
            events => {
              res.writeHead(200, DEFAULT_HEADERS);
              res.write(JSON.stringify(events));
              res.end();
            },
            err => {
              res.writeHead(500, DEFAULT_HEADERS);
              res.write(JSON.stringify(err));
              res.end();
            }
          );
        }
      } else {
        // User not logged in to google, create an authentication url
        res.redirect(AuthenticationService.getGoogleAuthenticationUrl());
        res.end();
      }
    });
  } else {
    res.writeHead(400);
    res.write('Parameters next (number) or from and to in format "yyyy-mm-dd" needs to be supplied.');
    res.end();
  }
};

let pollerService: EventDataPollerService<ReadonlyArray<CalendarEvent>>;
const createAndStartPollerService = (comming: number, res: express.Response) => {
  const handler: EventDataHandler<ReadonlyArray<CalendarEvent>> = {
    data: result => {
      res.write(resultToSseData(result));
    },
    heartbeat: heartbeat => {
      res.write(resultToHeartbeatData(heartbeat.time));
    },
    error: err => {
      res.write(errorToSseData(err));
    },
  };
  const pollFn = () => CalendarService.getNextCalendarEvents(comming);

  pollerService = new EventDataPollerService(pollFn, handler, CALENDAR_REFRESH_INTERVAL);
};

const stopPollerService = () => pollerService.finish();

export default { getCalendarEventsFromRequest };
