import React, { useEffect, useState } from 'react';
import ReactSVG from 'react-svg';
import { Forecast } from '../../../shared/types/Weather.models';
import api from '../../apis';
import { getLocation } from '../../App.service';
import * as util from './Weather.utils';
import './Weather.css';

// Every 30 second
const TIME_REFRESH_INTERVAL = 30 * 1000;

type WeatherProps = {
  forecast: Forecast;
};

const MainWeather = ({ forecast }: WeatherProps) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const updateNow = () => setNow(new Date());
    const timeInterval = window.setInterval(updateNow, TIME_REFRESH_INTERVAL);
    return () => {
      clearInterval(timeInterval);
    };
  }, [now]);
  return (
    <div className="Weather-main">
      <p className="Weather-main--strong">{util.dateToTime(now)}</p>
      <ReactSVG
        beforeInjection={svg => {
          svg.classList.add('Weather-main__svg');
        }}
        src={require(`./svgs/animated/${forecast.symbol}.svg`)}
      />
      <div>
        <p className="Weather-main--strong">{forecast.degrees.toFixed(0)}°</p>
        <div className="Weather-main--weak">
          <ReactSVG
            beforeInjection={svg => {
              svg.setAttribute('style', `transform:rotate(${forecast.windDirection}deg)`);
            }}
            src={require('./svgs/static/wind.svg')}
            wrapper="span"
          />
          <span>{`${forecast.windSpeed.toFixed(0)} m/s`}</span>
          <ReactSVG src={require('./svgs/static/precipitation.svg')} wrapper="span" />
          <span>{`${forecast.precipitation} mm/h`}</span>
        </div>
      </div>
    </div>
  );
};
const CommingWeather = ({ forecast }: WeatherProps) => (
  <div className="Weather-comming">
    <ReactSVG src={require(`./svgs/static/${forecast.symbol}.svg`)} />
    {<p>{util.dateToTime(new Date(forecast.time))}</p>}
    <p>{forecast.degrees.toFixed(0)}°</p>
    <div className="Weather-comming--weak">
      <ReactSVG
        beforeInjection={svg => {
          svg.setAttribute('style', `transform:rotate(${forecast.windDirection}deg)`);
        }}
        src={require('./svgs/static/wind.svg')}
        wrapper="span"
      />
      <span>{`${forecast.windSpeed.toFixed(0)} m/s`}</span>
      <br />
      <ReactSVG src={require('./svgs/static/precipitation.svg')} wrapper="span" />
      <span>{`${forecast.precipitation} mm/h`}</span>
    </div>
  </div>
);

export default function() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [eventSource, setEventSource] = useState<EventSource>();

  useEffect(() => {
    getLocation().then(location => {
      setEventSource(api.getForecastEventSource(location.lat, location.lon));
    });
  }, []);
  useEffect(() => {
    if (eventSource) {
      eventSource.onmessage = e => {
        if (e.data) {
          setForecasts(JSON.parse(e.data));
        }
      };
    }
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);
  return (
    <div>
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
        <span>Fetching weather data...</span>
      )}
    </div>
  );
}
