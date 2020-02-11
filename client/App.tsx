import React from 'react';
import './App.css';
import Weather from './widgets/Weather';
import Calendar from './widgets/Calendar';
import SavingsGoal from './widgets/SavingsGoal';
import Temperature from './widgets/Temperature';
import HomeAlarm from './widgets/HomeAlarm';

export default () => {
  return (
    <div className="App">
      <Weather />
      <Calendar />
      <Temperature />
      <SavingsGoal />
      <HomeAlarm />
    </div>
  );
};
