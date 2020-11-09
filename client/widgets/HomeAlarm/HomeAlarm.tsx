import React, { useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import Spinner from '../../components/Spinner/Spinner';
import { HomeAlarmInfo, ArmedStatus, SseData } from '../../../shared/types';
import api from '../../apis/Api';
import * as util from '../../utils/DateUtils';
import './HomeAlarm.css';

export default function () {
  const [alarmInfo, setAlarmInfo] = useState<HomeAlarmInfo>();
  const [activate, setActivate] = useState<boolean>(false);

  const armedStatusClassName = (status: ArmedStatus): string => {
    if (activate) {
      return 'activating';
    }
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

  const handleImageClick = () => {
    if (!activate) {
      setActivate(true);
      api.postToggleAlarmStatus().then(info => {
        setAlarmInfo({ ...info, time: new Date(info.time) });
        setActivate(false);
      });
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
        role="img"
        onClick={handleImageClick}
        beforeInjection={svg => {
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', `Alarm indicator '${alarmInfo.status}'`);
        }}
        className={`HomeAlarm--indicator ${armedStatusClassName(alarmInfo.status)}`}
        src="./svgs/static/house.svg"
      />
      <div className="HomeAlarm--time">{util.timeAgo(new Date(alarmInfo.time))}</div>
    </div>
  ) : (
    <Spinner />
  );
}
