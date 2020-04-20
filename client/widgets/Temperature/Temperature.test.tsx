import 'jest';
import React from 'react';
import { cleanup, render, wait } from '@testing-library/react';
import TemperatureComponent from './Temperature';
import { Temperature, SseData } from '../../../shared/types';

let mockIndoorTemperatureEventSource = new EventSource('mock-url');
jest.mock('../../apis/Api', () => ({
  getIndoorTemperaturesEventSource: () => mockIndoorTemperatureEventSource,
}));

describe('Temperature', () => {
  describe('Component', () => {
    afterEach(cleanup);
    it('renders', () => {
      render(<TemperatureComponent />);
    });

    it('renders temperatures', async () => {
      const tempData: SseData<Temperature[]> = {
        result: [
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
        ],
      };

      const { getByText } = render(<TemperatureComponent />);
      await wait(() => {
        mockIndoorTemperatureEventSource.onmessage!({
          data: JSON.stringify(tempData),
        } as MessageEvent);
      });
      expect(getByText('Kitchen')).toBeDefined();
      expect(getByText('22°')).toBeDefined();
      expect(getByText('Living room')).toBeDefined();
      expect(getByText('28°')).toBeDefined();
    });

    it('renders labeled temperatures', async () => {
      const tempData: SseData<Temperature[]> = {
        result: [
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
        ],
      };

      const { getByLabelText } = render(<TemperatureComponent />);
      await wait(() => {
        mockIndoorTemperatureEventSource.onmessage!({
          data: JSON.stringify(tempData),
        } as MessageEvent);
      });
      expect(getByLabelText('hot').textContent).toBe('28°');
      expect(getByLabelText('warm').textContent).toBe('22°');
      expect(getByLabelText('cold').textContent).toBe('18°');
      expect(getByLabelText('chilly').textContent).toBe('12°');
    });
  });
});
