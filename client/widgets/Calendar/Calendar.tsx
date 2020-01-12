import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../../shared/types';
import api from '../../apis';
import './Calendar.css';
import * as util from './Calendar.utils';

type WeekdayProps = {
  date: Date;
  events: string[];
};
const Weekday = ({ date, events }: WeekdayProps) => (
  <div className="Calendar-weekday">
    <p>{date.getDate()}</p>
    <div>{events.length ? events.map(e => <span key={e}>{e}</span>) : 'No plans!'}</div>
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
          events={events.filter(e => util.isSameDay(d, e.from)).map(e => e.summary)}
        />
      ))}
    </div>
  );
};
