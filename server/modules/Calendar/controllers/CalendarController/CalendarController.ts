import express from 'express';
import CalendarService from '../../services/CalendarService';
import { AuthenticationService } from '../../../Authentication';
import { DEFAULT_HEADERS, SSE_HEADERS, jsonToSseData } from '../../../../utils';

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
          // Sse requested, keep connection open and feed with weather data
          res.writeHead(200, SSE_HEADERS);
          pollNextEvents(comming, res);
          res.on('close', () => stopPollEvents());
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

let timer: any;
const pollNextEvents = (comming: number, res: express.Response) => {
  const pollFn = (comming: number, res: express.Response) => {
    CalendarService.getNextCalendarEvents(comming).then(
      events => {
        res.write(jsonToSseData(events));
      },
      err => {
        res.write(jsonToSseData(err));
      }
    );
  };
  timer = setInterval(pollFn, CALENDAR_REFRESH_INTERVAL, comming, res);
  pollFn(comming, res);
};

const stopPollEvents = () => clearInterval(timer);

export default { getCalendarEventsFromRequest };
