import express from 'express';
import CalendarService from './Calendar.service';
import { AuthenticationService } from '../Authentication';
import { DEFAULT_HEADERS, SSE_HEADERS } from '../../utils';
import { PollHandler } from '../../services';
import { CalendarEvent } from '../../../shared/types';

// Every hour
const CALENDAR_REFRESH_INTERVAL = 60 * 60 * 1000;
const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;

let pollHandler: PollHandler<ReadonlyArray<CalendarEvent>>;
const getCalendarEventsFromRequest = (req: express.Request, res: express.Response): void => {
  const from = req.query.from as string;
  const to = req.query.from as string;
  const next = +req.query.next!;
  const sse = req.query.sse;
  if ((next && typeof next === 'number') || (from && DATE_REGEX.test(from) && to && DATE_REGEX.test(to))) {
    const dateFrom = from ? new Date(from) : null;
    if (dateFrom) {
      dateFrom.setHours(0);
      dateFrom.setMinutes(0);
      dateFrom.setMilliseconds(0);
    }
    const dateTo = to ? new Date(to) : null;
    if (dateTo) {
      dateTo.setHours(23);
      dateTo.setMinutes(59);
    }
    const comming = next ? next : null;

    AuthenticationService.isConnectedToGoogle().then(ready => {
      if (ready) {
        if (sse && comming) {
          // Sse requested, keep connection open and feed with calendar event data
          res.writeHead(200, SSE_HEADERS);

          if (!pollHandler) {
            const pollFn = () => CalendarService.getNextCalendarEvents(comming);
            pollHandler = new PollHandler(pollFn, CALENDAR_REFRESH_INTERVAL);
          }
          pollHandler.registerPollerService(res, req);

          req.on('close', () => pollHandler.unregisterPollerService(res, req));
        } else {
          const request = comming
            ? CalendarService.getNextCalendarEvents(comming)
            : CalendarService.getCalendarEventsByDates(dateFrom!, dateTo!);
          request.then(
            events => {
              if (pollHandler && comming) {
                pollHandler.reportData(events);
              }
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

export default { getCalendarEventsFromRequest };
