import React from 'react';
import './App.css';
import Weather from './widgets/Weather';
import Calendar from './widgets/Calendar';
import Number from './widgets/Number';

export default () => {
  return (
    <div className="App">
      <Weather />
      <Calendar />
      <Number />
    </div>
  );
};
