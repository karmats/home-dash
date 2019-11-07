import React from 'react';
import './SavingsGoal.css';

const numberLocale = (num: number, locale?: string) => num.toLocaleString(locale || 'SV-se');
export default function() {
  const current = 2500;
  const goal = 12000;
  return (
    <div className="SavingsGoal-main">
      <div>{`${numberLocale(current)} / ${numberLocale(goal)}`}</div>
    </div>
  );
}
