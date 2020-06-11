import 'jest';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import HomeAlarmComponent from './HomeAlarm';
import { SseData, HomeAlarmInfo } from '../../../shared/types';

jest.mock('react-svg');
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

      const { getByText } = render(<HomeAlarmComponent />);
      await waitFor(() => {
        mockHomeAlarmStatusEventSource.onmessage!({
          data: JSON.stringify(alarmData),
        } as MessageEvent);
      });
      expect(getByText('12:25')).toBeDefined();
    });
  });
});
