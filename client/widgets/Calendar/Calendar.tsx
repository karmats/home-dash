import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../../shared/types';
import api from '../../apis';
import './Calendar.css';
import * as util from './Calendar.utils';

type EventsByDate = {
  [date: string]: CalendarEvent[];
};

type WeekdayProps = {
  date: Date;
  events: CalendarEvent[];
};

const EVENTS_TO_SHOW = 10;

const calendarEventsToEventsByDate = (events: CalendarEvent[]) =>
  events.reduce((acc, event) => {
    let currDate = event.from;
    const endDate = event.to;
    const eventDates = [util.getDateAsIsoString(currDate)];
    while (!util.isSameDay(currDate, endDate)) {
      currDate.setDate(currDate.getDate() + 1);
      eventDates.push(util.getDateAsIsoString(currDate));
    }
    eventDates.forEach(date => {
      if (!acc[date]) {
        acc[date] = [event];
      } else {
        acc[date].push(event);
      }
    });
    return acc;
  }, {} as EventsByDate);
const eventToString = (event: CalendarEvent) =>
  `${util.getDateAsTimeString(event.from)} - ${util.getDateAsTimeString(event.to)} ${event.summary}`;

const Weekday = ({ date, events }: WeekdayProps) => (
  <div className={`Calendar-weekday${util.isToday(date) ? ' Calendar-weekday--today' : ''}`}>
    <p>{date.getDate()}</p>
    <div className="Calendar-weekday--event">
      {events.length
        ? events.map(e => <div key={`${e.from.toISOString()}_${e.to.toISOString}`}>{eventToString(e)}</div>)
        : ''}
    </div>
  </div>
);

export default () => {
  const [events, setEvents] = useState<EventsByDate>({});
  useEffect(() => {
    api.getNextCalendarEvents(EVENTS_TO_SHOW).then(result => {
      setEvents(calendarEventsToEventsByDate(result));
    });
  }, []);
  return (
    <div className="Calendar-main">
      {Object.keys(events).map(d => (
        <Weekday key={d} date={new Date(d)} events={events[d]} />
      ))}
    </div>
  );
};
