import React from 'react';
import './App.css';
import Weather from './widgets/Weather';
import Calendar from './widgets/Calendar';
import Temperature from './widgets/Temperature';
import HomeAlarm from './widgets/HomeAlarm';
import News from './widgets/News';

export default function () {
  return (
    <div className="App">
      <Weather />
      <Calendar />
      <HomeAlarm />
      <Temperature />
      <News />
    </div>
  );
}
