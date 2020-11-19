import 'jest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import HomeAlarmComponent from './HomeAlarm';
import { HomeAlarmInfo } from '../../../shared/types';

jest.mock('react-svg');
let mockUseEventSourceWithRefresh = {
  data: { online: true, status: 'unknown', time: 0 } as HomeAlarmInfo,
  refreshData: () => {},
  updateData: () => {},
};
jest.mock('../../hooks', () => ({
  useEventSourceWithRefresh: () => mockUseEventSourceWithRefresh,
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
      const alarmData: HomeAlarmInfo = {
        online: true,
        status: 'full',
        time: date,
      };
      mockUseEventSourceWithRefresh = {
        ...mockUseEventSourceWithRefresh,
        data: alarmData,
      };

      const { getByText } = render(<HomeAlarmComponent />);
      expect(getByText('idag kl. 12:25')).toBeDefined();
    });
  });
});
