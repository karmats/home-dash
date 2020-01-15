import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../../shared/types';
import api from '../../apis';
import './Calendar.css';
import * as util from './Calendar.utils';

type WeekdayProps = {
  date: Date;
  events: CalendarEvent[];
};

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  useEffect(() => {
    const { from, to } = util.getCurrentWeekStartAndEnd();
    api.getCalendarEvents(from, to).then(result => {
      setEvents(result);
    });
  }, []);
  return (
    <div className="Calendar-main">
      {util.getWeekDates(new Date()).map(d => (
        <Weekday
          key={`${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`}
          date={d}
          events={events.filter(e => util.isSameDay(d, e.from))}
        />
      ))}
    </div>
  );
};
