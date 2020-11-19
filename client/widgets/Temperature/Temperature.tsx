import React from 'react';
import Spinner from '../../components/Spinner/Spinner';
import { Temperature } from '../../../shared/types';
import api from '../../apis/Api';
import { useEventSourceWithRefresh } from '../../hooks';
import './Temperature.css';

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

const temperatureEventSourceConfig = {
  eventSource: api.getIndoorTemperaturesEventSource(),
};
export default function () {
  const { data: temperatures, refreshData: refreshTemperatures } = useEventSourceWithRefresh<Temperature[]>(
    [],
    temperatureEventSourceConfig,
    api.getIndoorTemperatures
  );

  return temperatures.length ? (
    <div className="Temperature-main" onClick={refreshTemperatures}>
      {temperatures.map(t => (
        <div key={t.location} className="Temperature-box">
          <span>{t.location}</span>
          <TemperatureText temperature={t.value} />
        </div>
      ))}
    </div>
  ) : (
    <Spinner />
  );
}
