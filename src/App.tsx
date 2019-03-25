import React from 'react';
import './App.css';
import Weather from './widgets/Weather';
import Calendar from './widgets/Calendar';
import NextTrip from './widgets/NextTrip';

export default () => {
  return (
    <div className="App">
      <Weather />
      <Calendar />
      <NextTrip />
    </div>
  );
};
