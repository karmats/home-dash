import React, { useState, useEffect } from 'react';
import UserService from '../../services/UserService';
import Spinner from '../../components/Spinner/Spinner';
import { SseData, CalendarEvent } from '../../../shared/types';
import api from '../../apis/Api';
import './Calendar.css';
import * as util from './Calendar.utils';

type EventsByDate = {
  [date: string]: CalendarClientEvent[];
};

type WeekdayProps = {
  date: Date;
  events: CalendarClientEvent[];
};
type MonthHeaderProps = {
  month: string;
};
type CalendarClientEvent = {
  from: Date;
  to: Date;
  isAllDay: boolean;
  summary: string;
};

const EVENTS_TO_SHOW = 20;

const calendarEventsToEventsByDate = (events: CalendarEvent[]) =>
  events.reduce(
    (acc, event) => {
      const fromIsAllDay = !!event.from.date;
      const startDate = event.from.date ? new Date(event.from.date) : new Date(event.from.dateTime!);
      const endDate = event.to.date
        ? // Google adds a day for some reason when it's a whole day event, so we need to substract it
          new Date(new Date(event.to.date).getTime() - 1000 * 60 * 60 * 24)
        : new Date(event.to.dateTime!);
      let currDate = new Date(startDate.getTime());
      const eventDates = [util.getDateAsIsoString(currDate)];
      while (!util.isSameDay(currDate, endDate)) {
        currDate.setDate(currDate.getDate() + 1);
        eventDates.push(util.getDateAsIsoString(currDate));
      }
      const toCalendarClientEvent = () => ({
        isAllDay: fromIsAllDay,
        from: startDate,
        to: endDate,
        summary: event.summary,
      });
      eventDates.forEach(date => {
        if (!acc[date]) {
          acc[date] = [toCalendarClientEvent()];
        } else {
          acc[date].push(toCalendarClientEvent());
        }
      });
      return acc;
    },
    {
      [util.getDateAsIsoString(new Date())]: [],
    } as EventsByDate
  );
const eventToString = (event: CalendarClientEvent) => {
  if (event.isAllDay) {
    return event.summary;
  }
  return `${util.getDateAsTimeString(event.from)} - ${util.getDateAsTimeString(event.to)} ${event.summary}`;
};

const Weekday = ({ date, events }: WeekdayProps) => (
  <div className={`Calendar-weekday${util.isToday(date) ? ' Calendar-weekday--today' : ''}`}>
    <div className="Calendar-weekday--date">
      <div>{date.getDate()}</div>
      <div>{util.getWeekdayName(date, UserService.getLocale())}</div>
    </div>
    <div className="Calendar-weekday--event">
      {events.length ? (
        events.map(e => <div key={`${e.from.toISOString()}_${e.to.toISOString()}`}>{eventToString(e)}</div>)
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
    const eventSource = api.getNextCalendarEventsEventSource(EVENTS_TO_SHOW);
    if (eventSource) {
      eventSource.onmessage = e => {
        const { result, error }: SseData<CalendarEvent[]> = JSON.parse(e.data);
        if (result) {
          setEvents(calendarEventsToEventsByDate(result));
        } else if (error) {
          console.error(error);
        }
      };
    }
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);
  const eventKeys = Object.keys(events);
  return eventKeys.length ? (
    <div className="Calendar-main">
      {eventKeys.map((d, idx, dates) => {
        const weekday = <Weekday key={d} date={new Date(d)} events={events[d]} />;
        const curr = new Date(d);
        const prev = idx !== 0 ? new Date(dates[idx - 1]) : curr;
        if (idx === 0 || curr.getMonth() !== prev.getMonth()) {
          const month = util.getMonthName(curr, UserService.getLocale());
          return (
            <React.Fragment key={`${curr.getFullYear()}_${month}`}>
              <MonthHeader month={month} />
              {weekday}
            </React.Fragment>
          );
        }
        return weekday;
      })}
    </div>
  ) : (
    <Spinner />
  );
};
