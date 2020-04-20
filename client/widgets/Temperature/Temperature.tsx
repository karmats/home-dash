import React, { useState, useEffect } from 'react';
import { Temperature, SseData } from '../../../shared/types';
import './Temperature.css';
import api from '../../apis/Api';

const getTemperatureLabel = (temperature: number) => {
  if (temperature < 15) {
    return 'chilly';
  } else if (temperature >= 15 && temperature < 20) {
    return 'cold';
  } else if (temperature >= 20 && temperature < 26) {
    return 'warm';
  } else {
    return 'hot';
  }
};

const TemperatureText = ({ temperature }: { temperature: number }) => {
  const label = getTemperatureLabel(temperature);
  return (
    <span aria-label={label} className={label}>
      {temperature}°
    </span>
  );
};

export default function () {
  const [temperatures, setTemperatures] = useState<Temperature[]>([]);

  useEffect(() => {
    const eventSource = api.getIndoorTemperaturesEventSource();
    if (eventSource) {
      eventSource.onmessage = e => {
        if (e.data) {
          const { result, error }: SseData<Temperature[]> = JSON.parse(e.data);
          if (result) {
            setTemperatures(result);
          } else if (error) {
            console.error(error);
          }
        }
      };
    }
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);
  return (
    <div className="Temperature-main">
      {temperatures.map(t => (
        <div key={t.location} className="Temperature-box">
          <span>{t.location}</span>
          <TemperatureText temperature={t.value} />
        </div>
      ))}
    </div>
  );
}
