import express from 'express';
import CalendarService from '../../services/CalendarService';
import { AuthenticationService } from '../../../Authentication';
import { defaultHeaders } from '../../../../utils';

const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;

const getCalendarEventsFromRequest = (req: express.Request, res: express.Response) => {
  const { from, to, next } = req.query;
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
        const request = comming
          ? CalendarService.getNextCalendarEvents(comming)
          : CalendarService.getCalendarEventsByDates(dateFrom, dateTo);
        request.then(
          events => {
            res.writeHead(200, defaultHeaders);
            res.write(JSON.stringify(events));
            res.end();
          },
          err => {
            res.writeHead(500, defaultHeaders);
            res.write(JSON.stringify(err));
            res.end();
          }
        );
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
