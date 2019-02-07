import React from 'react';
import './App.css';
import Weather from './widgets/Weather';
import NextTrip from './widgets/NextTrip';

export default () => {
  return (
    <div className="App">
      <Weather />
      <NextTrip />
    </div>
  );
};
