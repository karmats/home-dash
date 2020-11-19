import 'jest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import TemperatureComponent from './Temperature';
import { Temperature } from '../../../shared/types';

let mockUseEventSourceWithRefresh = {
  data: [] as Temperature[],
  refreshData: () => {},
};
jest.mock('../../hooks', () => ({
  useEventSourceWithRefresh: () => mockUseEventSourceWithRefresh,
}));
describe('Temperature', () => {
  describe('Component', () => {
    afterEach(cleanup);
    it('renders', () => {
      render(<TemperatureComponent />);
    });

    it('renders indication that home alarm is fetching', () => {
      const { getByText } = render(<TemperatureComponent />);
      const indicator = getByText('Loading...');
      expect(indicator).toBeDefined();
    });

    it('renders temperatures', async () => {
      const tempData: Temperature[] = [
        {
          location: 'Kitchen',
          value: 22,
          scale: 'C',
        },
        {
          location: 'Living room',
          value: 28,
          scale: 'C',
        },
      ];
      mockUseEventSourceWithRefresh = {
        ...mockUseEventSourceWithRefresh,
        data: tempData,
      };

      const { getByText } = render(<TemperatureComponent />);
      expect(getByText('Kitchen')).toBeDefined();
      expect(getByText('22°')).toBeDefined();
      expect(getByText('Living room')).toBeDefined();
      expect(getByText('28°')).toBeDefined();
    });

    it('renders labeled temperatures', async () => {
      const tempData: Temperature[] = [
        {
          location: 'Kitchen',
          value: 28,
          scale: 'C',
        },
        {
          location: 'Bedroom',
          value: 22,
          scale: 'C',
        },
        {
          location: 'Living room',
          value: 18,
          scale: 'C',
        },
        {
          location: 'Basement',
          value: 12,
          scale: 'C',
        },
      ];
      mockUseEventSourceWithRefresh = {
        ...mockUseEventSourceWithRefresh,
        data: tempData,
      };

      const { getByLabelText } = render(<TemperatureComponent />);
      expect(getByLabelText('hot').textContent).toBe('28°');
      expect(getByLabelText('warm').textContent).toBe('22°');
      expect(getByLabelText('cold').textContent).toBe('18°');
      expect(getByLabelText('chilly').textContent).toBe('12°');
    });
  });
});
