import React, { useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import { HomeAlarmInfo, ArmedStatus, SseData } from '../../../shared/types';
import api from '../../apis/Api';
import './HomeAlarm.css';
import { dateToTime } from '../Weather/Weather.utils';

export default function () {
  const [alarmInfo, setAlarmInfo] = useState<HomeAlarmInfo>();

  const armedStatusClassName = (status: ArmedStatus): string => {
    switch (status) {
      case 'full':
        return 'armed';
      case 'partial':
        return 'partial';
      case 'off':
        return 'unarmed';
      default:
        return '';
    }
  };

  useEffect(() => {
    const eventSource = api.getHomeAlarmStatusEventSource();
    if (eventSource) {
      eventSource.onmessage = e => {
        if (e.data) {
          const { result, error }: SseData<HomeAlarmInfo> = JSON.parse(e.data);
          if (result) {
            setAlarmInfo({ ...result, time: new Date(result.time) });
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
  return alarmInfo ? (
    <div className="HomeAlarm-main">
      <ReactSVG
        className={`HomeAlarm--indicator ${armedStatusClassName(alarmInfo.status)}`}
        src="./svgs/static/house.svg"
      />
      <div className="HomeAlarm--time">{dateToTime(new Date(alarmInfo.time))}</div>
    </div>
  ) : (
    <span>Loading</span>
  );
}
