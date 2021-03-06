import React, { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { Forecast } from '../../../shared/types';
import api from '../../apis/Api';
import Spinner from '../../components/Spinner/Spinner';
import { useEventSourceWithRefresh } from '../../hooks';
import * as util from '../../utils/DateUtils';
import './Weather.css';

// Every 10 second
const TIME_REFRESH_INTERVAL = 10 * 1000;

const toInteger = (dec: number) => {
  const integer = dec.toFixed(0);
  return integer === '-0' ? '0' : integer;
};

type WeatherProps = {
  forecast: Forecast;
};

const Clock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const updateNow = () => setNow(new Date());
    const timeInterval = window.setInterval(updateNow, TIME_REFRESH_INTERVAL);
    return () => {
      clearInterval(timeInterval);
    };
  }, [now]);
  return <p className="Clock-main">{util.dateToTime(now)}</p>;
};

const MainWeather = ({ forecast }: WeatherProps) => {
  return (
    <div className="Weather-main">
      <Clock />
      <ReactSVG
        beforeInjection={svg => {
          svg.classList.add('Weather-main__svg');
        }}
        src={`./svgs/animated/${forecast.symbol}.svg`}
      />
      <div>
        <p className="Weather-main--strong">{toInteger(forecast.degrees)}°</p>
        <div className="Weather-main--weak">
          <ReactSVG
            beforeInjection={svg => {
              svg.setAttribute('style', `transform:rotate(${forecast.windDirection}deg)`);
            }}
            src={'./svgs/static/wind.svg'}
            wrapper="span"
          />
          <span>{`${toInteger(forecast.windSpeed)} m/s`}</span>
          <ReactSVG src={'./svgs/static/precipitation.svg'} wrapper="span" />
          <span>{`${forecast.precipitation} mm/h`}</span>
        </div>
      </div>
    </div>
  );
};
const CommingWeather = ({ forecast }: WeatherProps) => (
  <div className="Weather-comming">
    <ReactSVG src={`./svgs/static/${forecast.symbol}.svg`} />
    {<p>{util.dateToTime(new Date(forecast.time))}</p>}
    <div className="Weather-comming--weak">
      <div className="Weather-comming--weak__details">
        <ReactSVG src={'./svgs/static/temperature.svg'} wrapper="span" />
        <span>{toInteger(forecast.degrees)}°</span>
      </div>
      <div className="Weather-comming--weak__details">
        <ReactSVG src={'./svgs/static/precipitation.svg'} wrapper="span" />
        <span>{`${forecast.precipitation}`}</span>
      </div>
    </div>
  </div>
);

const forecastEventSourceConfig = {
  eventSource: api.getForecastEventSource(),
};
export default function (): JSX.Element {
  const { data: forecasts, refreshData: refreshForecasts } = useEventSourceWithRefresh<Forecast[]>(
    [],
    forecastEventSourceConfig,
    api.getForecasts
  );
  return (
    <div onClick={refreshForecasts}>
      {forecasts.length ? (
        <>
          <MainWeather forecast={forecasts[0]} />
          <div className="Weather-footer">
            <CommingWeather forecast={forecasts[2]} />
            <CommingWeather forecast={forecasts[4]} />
            <CommingWeather forecast={forecasts[6]} />
            <CommingWeather forecast={forecasts[8]} />
          </div>
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
