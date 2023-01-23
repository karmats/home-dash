import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { HomeAlarmInfo } from '../../../shared/types';
import api from '../../apis/Api';
import HomeAlarmComponent from './HomeAlarm';

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
vi.mock('../../apis/Api', () => ({
  __esModule: true,
  default: {
    postToggleAlarmStatus: vi.fn(() => Promise.resolve(createAlarmData())),
    getHomeAlarmStatusEventSource: vi.fn(),
  },
}));
let mockUseEventSourceWithRefresh = {
  data: { online: true, status: 'unknown', time: 0 } as HomeAlarmInfo,
  refreshData: () => {},
  updateData: () => {},
};
vi.mock('../../hooks', () => ({
  useEventSourceWithRefresh: () => mockUseEventSourceWithRefresh,
}));

describe('HomeAlarm', () => {
  describe('Component', () => {
    it('renders', () => {
      render(<HomeAlarmComponent />);
    });

    it('renders indication that home alarm is fetching', () => {
      const { getByText } = render(<HomeAlarmComponent />);
      const indicator = getByText('Loading...');
      expect(indicator).toBeDefined();
    });

    it.skip('renders home alarm status', () => {
      const alarmData = createAlarmData();
      mockUseEventSourceWithRefresh = {
        ...mockUseEventSourceWithRefresh,
        data: alarmData,
      };

      const { getByText } = render(<HomeAlarmComponent />);
      expect(getByText('idag kl. 12:25')).toBeDefined();
    });

    it.skip('toggles home alarm status', async () => {
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
