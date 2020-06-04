import 'jest';
import React from 'react';
import { cleanup, render, wait } from '@testing-library/react';
import HomeAlarmComponent from './HomeAlarm';
import { SseData, HomeAlarmInfo } from '../../../shared/types';

let mockHomeAlarmStatusEventSource = new EventSource('mock-url');
jest.mock('../../apis/Api', () => ({
  getHomeAlarmStatusEventSource: () => mockHomeAlarmStatusEventSource,
}));

describe('HomeAlarm', () => {
  describe('Component', () => {
    afterEach(cleanup);
    it('renders', () => {
      render(<HomeAlarmComponent />);
    });

    it('renders indication that home alarm is fetching', () => {
      const { getByText } = render(<HomeAlarmComponent />);
      const indicator = getByText('Loading...');
      expect(indicator).toBeDefined();
    });

    it('renders home alarm status', async () => {
      const date = new Date();
      date.setHours(12);
      date.setMinutes(25);
      const alarmData: SseData<HomeAlarmInfo> = {
        result: {
          online: true,
          status: 'full',
          time: date,
        },
      };

      const { getByText, getByRole } = render(<HomeAlarmComponent />);
      await wait(() => {
        mockHomeAlarmStatusEventSource.onmessage!({
          data: JSON.stringify(alarmData),
        } as MessageEvent);
      });
      expect(getByText('12:25')).toBeDefined();
      expect(getByRole('img')).toBeDefined();
    });
  });
});
