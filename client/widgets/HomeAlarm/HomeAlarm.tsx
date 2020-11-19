import React, { useState } from 'react';
import { ReactSVG } from 'react-svg';
import Spinner from '../../components/Spinner/Spinner';
import { HomeAlarmInfo, ArmedStatus } from '../../../shared/types';
import api from '../../apis/Api';
import * as util from '../../utils/DateUtils';
import { useEventSourceWithRefresh } from '../../hooks';
import './HomeAlarm.css';

const homeAlarmEventSourceConfig = {
  eventSource: api.getHomeAlarmStatusEventSource(),
};
export default function () {
  const [activate, setActivate] = useState<boolean>(false);
  const { data: alarmInfo, refreshData: refreshAlarmInfo, updateData: updateAlarmInfo } = useEventSourceWithRefresh<
    HomeAlarmInfo
  >({ online: true, status: 'unknown', time: 0 }, homeAlarmEventSourceConfig, api.getHomeAlarmStatus);

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

  const handleImageClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!activate) {
      setActivate(true);
      api.postToggleAlarmStatus().then(info => {
        updateAlarmInfo({ ...info, time: new Date(info.time) });
        setActivate(false);
      });
    }
  };

  return alarmInfo && alarmInfo.status !== 'unknown' ? (
    <div className="HomeAlarm-main" onClick={refreshAlarmInfo}>
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
