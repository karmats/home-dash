import 'jest';
import React from 'react';
import { render, cleanup, wait } from '@testing-library/react';
import { WeatherSymbol, Forecast, SseData } from '../../../shared/types';
import * as util from './Weather.utils';
import Weather from './Weather';

// Mocks
jest.mock('react-svg');

let mockGetForecastEventSource: any = jest.fn();
jest.mock('../../apis/Api', () => ({
  getForecastEventSource: () => mockGetForecastEventSource,
}));

const mockGeolocation = {
  getCurrentPosition: jest.fn(success =>
    success({ coords: { latitude: 57.740614, longitude: 11.930191 }, timestamp: new Date().getTime() })
  ),
};

(global as any).navigator.geolocation = mockGeolocation;

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
  describe('Utils', () => {
    it('converts date to hours and minutes', () => {
      const d = new Date();
      d.setHours(2);
      d.setMinutes(5);
      expect(util.dateToTime(d)).toBe('02:05');
      d.setHours(15);
      d.setMinutes(32);
      expect(util.dateToTime(d)).toBe('15:32');
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
      expect(indicator.tagName).toBe('DIV');
    });
    it('renders main weather and comming weather', async () => {
      const eventSource = new EventSource('mock-url');
      mockGetForecastEventSource = eventSource;
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

      const { getByText } = render(<Weather />);
      await wait(() => {
        eventSource.onmessage!({
          data: JSON.stringify(smhiData),
        } as MessageEvent);
      });
      expect(getByText('8 m/s')).toBeDefined();
      expect(getByText('8°')).toBeDefined();
      expect(getByText('80 mm/h')).toBeDefined();
    });
  });
});
