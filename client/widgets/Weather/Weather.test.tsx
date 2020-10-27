import 'jest';
import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { WeatherSymbol, Forecast, SseData } from '../../../shared/types';
import Weather from './Weather';
import { act } from 'react-dom/test-utils';

// Mocks
jest.mock('react-svg');

let mockGetForecastEventSource: any = new EventSource('mock-url');
jest.mock('../../apis/Api', () => ({
  getForecastEventSource: () => mockGetForecastEventSource,
}));

jest.useFakeTimers();

const SVG_ROOT = '../../../public/svgs';

describe('Weather', () => {
  describe('Models', () => {
    it('has all weather symbol files', () => {
      Object.keys(WeatherSymbol).forEach(symbol => {
        const fileName = `${WeatherSymbol[symbol]}.svg`;
        expect(require(`${SVG_ROOT}/animated/${fileName}`)).toBeDefined();
        expect(require(`${SVG_ROOT}/static/${fileName}`)).toBeDefined();
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
    it('renders main weather and comming weather', async () => {
      const smhiData: SseData<Forecast[]> = {
        result: Array.from(new Array(10)).map((_, idx) => ({
          symbol: WeatherSymbol.CLEAR_SKY,
          degrees: idx,
          precipitation: idx * 10,
          windSpeed: idx,
          windDirection: idx * 10,
          time: Date.now(),
        })),
      };

      await act(async () => {
        render(<Weather />);
      });
      const { getByText } = render(<Weather />);
      await waitFor(() => {
        mockGetForecastEventSource.onmessage!({
          data: JSON.stringify(smhiData),
        } as MessageEvent);
      });
      // Main weather
      expect(getByText('0°')).toBeDefined();
      expect(getByText('0 mm/h')).toBeDefined();
      expect(getByText('0 m/s')).toBeDefined();
      // Comming weather
      expect(getByText('8°')).toBeDefined();
      expect(getByText('80')).toBeDefined();
    });
  });
});
