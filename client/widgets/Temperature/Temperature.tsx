import React from 'react';
import { Temperature } from '../../../shared/types';
import './Temperature.css';

export default function() {
  const temperatures: Temperature[] = [
    {
      location: 'Living room',
      value: 21,
      scale: 'C'
    },
    {
      location: 'Basement',
      value: 12,
      scale: 'C'
    },
    {
      location: 'Hallway',
      value: 22,
      scale: 'C'
    },
    {
      location: 'Kitchen',
      value: 23,
      scale: 'C'
    }
  ];
  return (
    <div className="Temperature-main">
      {temperatures.map(t => (
        <div key={t.location} className="Temperature-box">
          <span>{t.location}</span>
          <span>
            {t.value}°
          </span>
        </div>
      ))}
    </div>
  );
}
