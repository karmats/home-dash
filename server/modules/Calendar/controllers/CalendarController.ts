import express from 'express';
import CalendarService from '../services/CalendarService';
import { defaultHeaders } from '../../../utils';

const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;

const getCalendarEventsFromRequest = function(req: express.Request, res: express.Response) {
  console.log('Getting calendar events');
  const { from, to } = req.query;
  if (!from || !to || !DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
    res.writeHead(400);
    res.write('Parameters from and to in format "yyyy-mm-dd" needs to be supplied.');
    res.end();
  } else {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);
    CalendarService.getEvents(dateFrom, dateTo).then(
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
  }
};

export default { getCalendarEventsFromRequest };
