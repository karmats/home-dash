import express from 'express';
import CalendarService from '../../services/CalendarService';
import { AuthenticationService } from '../../../Authentication';
import { defaultHeaders } from '../../../../utils';

const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;

const getCalendarEventsFromRequest = (req: express.Request, res: express.Response) => {
  const { from, to } = req.query;
  if (!from || !to || !DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
    res.writeHead(400);
    res.write('Parameters from and to in format "yyyy-mm-dd" needs to be supplied.');
    res.end();
  } else {
    const dateFrom = new Date(from);
    dateFrom.setHours(0);
    dateFrom.setMinutes(0);
    dateFrom.setMilliseconds(0);
    const dateTo = new Date(to);
    dateTo.setHours(23);
    dateTo.setMinutes(59);

    AuthenticationService.isConnectedToGoogle().then(ready => {
      if (ready) {
        CalendarService.getCalendarEvents(dateFrom, dateTo).then(
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
  }
};

export default { getCalendarEventsFromRequest };
