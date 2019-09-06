import 'jest';
import React from 'react';
import { render, cleanup, waitForElement } from '@testing-library/react';
import { WeatherSymbol } from '../../../shared/types';
import * as util from './Weather.utils';
import Weather from './Weather';

// Mocks
jest.mock('react-svg');

const mockGeolocation = {
  getCurrentPosition: jest.fn(success =>
    success({ coords: { latitude: 57.740614, longitude: 11.930191 }, timestamp: new Date().getTime() })
  )
};
class EventSourceMock {
  constructor() {}
  close() {}
}
(global as any).navigator.geolocation = mockGeolocation;
(global as any).EventSource = EventSourceMock;

jest.useFakeTimers();

describe('Weather', () => {
  describe('Models', () => {
    it('has all weather symbol files', () => {
      Object.keys(WeatherSymbol).forEach(symbol => {
        const fileName = `${WeatherSymbol[symbol]}.svg`;
        expect(require(`./svgs/animated/${fileName}`)).toBeDefined();
        expect(require(`./svgs/static/${fileName}`)).toBeDefined();
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
    const smhiData = {
      mainTemp: 3
    };
    afterEach(cleanup);
    it('renders', () => {
      render(<Weather />);
    });
    it('renders indication that weather is fetching', () => {
      const { getByText } = render(<Weather />);
      const indicator = getByText('Fetching weather data...');
      expect(indicator).toBeDefined();
      expect(indicator.tagName).toBe('SPAN');
    });
    // FIXME
    xit('renders main weather and comming weather', async () => {
      const { getByText } = render(<Weather />);
      await waitForElement(() => getByText(`${smhiData.mainTemp}°`));
    });
  });
});
