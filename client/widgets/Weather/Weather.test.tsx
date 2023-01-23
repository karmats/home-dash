import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { Forecast, WeatherSymbol } from '../../../shared/types';
import Weather from './Weather';

// Mocks
vi.mock('react-svg');

let mockUseEventSourceWithRefresh = {
  data: [] as Forecast[],
  refreshData: () => {},
};
vi.mock('../../hooks', () => ({
  useEventSourceWithRefresh: () => mockUseEventSourceWithRefresh,
}));

vi.useFakeTimers();

const SVG_ROOT = '../../../public/svgs';

describe('Weather', () => {
  describe('Models', () => {
    it('has all weather symbol files', () => {
      Object.keys(WeatherSymbol).forEach(async symbol => {
        const fileName = `${(WeatherSymbol as any)[symbol]}.svg`;
        expect(await import(`${SVG_ROOT}/animated/${fileName}`)).toBeDefined();
        expect(await import(`${SVG_ROOT}/static/${fileName}`)).toBeDefined();
      });
    });
  });

  describe('Component', () => {
    afterEach(cleanup);
    it('renders', () => {
      render(<Weather />);
    });
    it('renders indication that weather is fetching', () => {
      const { getByText } = render(<Weather />);
      const indicator = getByText('Loading...');
      expect(indicator).toBeDefined();
    });
    it('renders main weather and comming weather', () => {
      const smhiData: Forecast[] = Array.from(new Array(10)).map((_, idx) => ({
        symbol: WeatherSymbol.CLEAR_SKY,
        degrees: idx,
        precipitation: idx * 10,
        windSpeed: idx,
        windDirection: idx * 10,
        time: Date.now(),
      }));
      mockUseEventSourceWithRefresh = {
        data: smhiData,
        refreshData: () => {},
      };

      const { getByText } = render(<Weather />);
      // Main weather
      expect(getByText('0°')).toBeDefined();
      expect(getByText('0 mm/h')).toBeDefined();
      expect(getByText('0 m/s')).toBeDefined();
      // Comming weather
      expect(getByText('8°')).toBeDefined();
      expect(getByText('80')).toBeDefined();
    });
    it('does not render -0', () => {
      const smhiData: Forecast[] = Array.from(new Array(10)).map((_, idx) => ({
        symbol: WeatherSymbol.CLEAR_SKY,
        degrees: idx - 0.2,
        precipitation: idx * 10,
        windSpeed: idx,
        windDirection: idx * 10,
        time: Date.now(),
      }));
      mockUseEventSourceWithRefresh = {
        data: smhiData,
        refreshData: () => {},
      };

      const { getByText, queryAllByText } = render(<Weather />);
      expect(queryAllByText('-0°')).toHaveLength(0);
      expect(getByText('0°')).toBeDefined();
    });
  });
});
