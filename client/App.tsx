import React from 'react';
import './App.css';
import Weather from './widgets/Weather';
import Calendar from './widgets/Calendar';
import SavingsGoal from './widgets/SavingsGoal';

export default () => {
  return (
    <div className="App">
      <Weather />
      <Calendar />
      <SavingsGoal />
    </div>
  );
};
