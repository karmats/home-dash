import React, { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
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
type MonthHeaderProps = {
  month: string;
};

const EVENTS_TO_SHOW = 20;

const calendarEventsToEventsByDate = (events: CalendarEvent[]) =>
  events.reduce(
    (acc, event) => {
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
    },
    {
      [util.getDateAsIsoString(new Date())]: []
    } as EventsByDate
  );
const eventToString = (event: CalendarEvent) =>
  `${util.getDateAsTimeString(event.from)} - ${util.getDateAsTimeString(event.to)} ${event.summary}`;

const Weekday = ({ date, events }: WeekdayProps) => (
  <div className={`Calendar-weekday${util.isToday(date) ? ' Calendar-weekday--today' : ''}`}>
    <div className="Calendar-weekday--date">
      <div>{date.getDate()}</div>
      <div>{util.getWeekdayName(date, UserService.getLocale())}</div>
    </div>
    <div className="Calendar-weekday--event">
      {events.length ? (
        events.map(e => <div key={`${e.from.toISOString()}_${e.to.toISOString}`}>{eventToString(e)}</div>)
      ) : (
        <div>Inga planer</div>
      )}
    </div>
  </div>
);

const MonthHeader = ({ month }: MonthHeaderProps) => (
  <div className="Calendar-month--header">
    <p>{month}</p>
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
      {Object.keys(events).map((d, idx, dates) => {
        const weekday = <Weekday key={d} date={new Date(d)} events={events[d]} />;
        const curr = new Date(d);
        const prev = idx !== 0 ? new Date(dates[idx - 1]) : curr;
        if (idx === 0 || curr.getMonth() !== prev.getMonth()) {
          const month = util.getMonthName(curr, UserService.getLocale());
          return (
            <React.Fragment key={month}>
              <MonthHeader month={month} />
              {weekday}
            </React.Fragment>
          );
        }
        return weekday;
      })}
    </div>
  );
};
