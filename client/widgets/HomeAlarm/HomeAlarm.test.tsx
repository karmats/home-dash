import 'jest';
import React from 'react';
import { cleanup, render, act, fireEvent, waitFor } from '@testing-library/react';
import HomeAlarmComponent from './HomeAlarm';
import { HomeAlarmInfo } from '../../../shared/types';
import api from '../../apis/Api';

// Helper functions
const createAlarmData = (): HomeAlarmInfo => {
  const date = new Date();
  date.setHours(12);
  date.setMinutes(25);
  const alarmData: HomeAlarmInfo = {
    online: true,
    status: 'full',
    time: date,
  };
  return alarmData;
};

// Mocks
jest.mock('../../apis/Api', () => ({
  __esModule: true,
  default: {
    postToggleAlarmStatus: jest.fn(() => Promise.resolve(createAlarmData())),
    getHomeAlarmStatusEventSource: jest.fn(),
  },
}));
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
      const alarmData = createAlarmData();
      mockUseEventSourceWithRefresh = {
        ...mockUseEventSourceWithRefresh,
        data: alarmData,
      };

      const { getByText } = render(<HomeAlarmComponent />);
      expect(getByText('idag kl. 12:25')).toBeDefined();
    });

    it('toggles home alarm status', async () => {
      const alarmData = createAlarmData();
      mockUseEventSourceWithRefresh = {
        ...mockUseEventSourceWithRefresh,
        data: alarmData,
      };

      const { getByRole } = render(<HomeAlarmComponent />);
      const trigger = getByRole('img');
      fireEvent.click(trigger);

      await waitFor(() => expect(api.postToggleAlarmStatus).toHaveBeenCalled());
    });
  });
});
