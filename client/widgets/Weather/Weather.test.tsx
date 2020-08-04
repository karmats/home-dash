import 'jest';
import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { WeatherSymbol, Forecast, SseData } from '../../../shared/types';
import Weather from './Weather';
import { act } from 'react-dom/test-utils';
import WeatherService from './Weather.service';

// Mocks
jest.mock('react-svg');

const MOCKED_LOCATION = {
  latitude: 40.73061,
  longitude: -73.935242,
};
const mockGeolocation = {
  getCurrentPosition: jest.fn((success, _) =>
    success({
      coords: MOCKED_LOCATION,
    })
  ),
};
(global as any).navigator.geolocation = mockGeolocation;

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

  describe('Service', () => {
    it('retrieves users geolocation', async () => {
      const location = await WeatherService.getLocation();
      expect(location).toEqual({ lat: MOCKED_LOCATION.latitude, lon: MOCKED_LOCATION.longitude });
    });
    it('retrieves default geolocation on error', async () => {
      mockGeolocation.getCurrentPosition = jest.fn((_, error) => error('Something went work'));
      const location = await WeatherService.getLocation();
      expect(location).toEqual(WeatherService.DEFAULT_LOCATION);
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
      expect(getByText('8 m/s')).toBeDefined();
      expect(getByText('8°')).toBeDefined();
      expect(getByText('80 mm/h')).toBeDefined();
    });
  });
});
