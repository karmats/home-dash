import React from 'react';
import './Calendar.css';
import * as util from './Calendar.utils';

type WeekdayProps = {
  date: Date;
  events: string[];
};
const Weekday = ({ date, events }: WeekdayProps) => (
  <div className="Calendar-weekday">
    <p>{date.getDate()}</p>
    <div>{events.length ? events.map(e => <span>{e}</span>) : 'No plans!'}</div>
  </div>
);

export default () => {
  return (
    <div className="Calendar-main">
      {util.getWeekDates(new Date()).map(d => (
        <Weekday key={`${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`} date={d} events={[]} />
      ))}
    </div>
  );
};
