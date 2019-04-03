import 'jest';
import React from 'react';
import { render, cleanup, waitForElement, act } from 'react-testing-library';
import * as api from './apis/SmhiApi';
import { WeatherSymbol } from './Weather.models';
import * as util from './Weather.utils';
import Weather from './Weather';
import { generateSmhiData } from './Weather.test.data';

// Mock user object and fetch smhi response
jest.mock('../../UserService', () => ({
  getUser: () => Promise.resolve({ lat: 57.740614, lon: 11.930191 })
}));
let fetchResponse: Promise<any> = Promise.resolve();
const mockFetch = jest.fn().mockImplementation(() => fetchResponse);
(global as any).fetch = mockFetch;

const defaultSmhiData = generateSmhiData();

jest.useFakeTimers();
describe('Weather', () => {
  describe('Models', () => {
    it('has all weather symbol files', () => {
      Object.keys(WeatherSymbol).forEach(symbol => {
        const fileName = `${WeatherSymbol[symbol as any]}.svg`;
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
    afterEach(cleanup);
    it('renders', () => {
      render(<Weather />);
    });
    it('renders indication that weather is fetching', async () => {
      const { getByText } = render(<Weather />);
      const indicator = getByText('Fetching weather data...');
      expect(indicator).toBeDefined();
      expect(indicator.tagName).toBe('SPAN');
    });
    xit('renders main weather and comming weather', async () => {
      const data = {
        mainTemp: 3
      };
      fetchResponse = Promise.resolve({ json: () => Promise.resolve(generateSmhiData(data.mainTemp)) });
      const component = render(<Weather />);
      act(() => {
        jest.runOnlyPendingTimers();
      });
      const gief = await waitForElement(() => {
        component.getByText(`${data.mainTemp}°`);
      });
      console.log(gief);
    });
  });
  describe('Apis', () => {
    describe('SMHI', () => {
      beforeEach(() => {
        fetchResponse = Promise.resolve({ json: () => Promise.resolve(defaultSmhiData) });
      });
      it('fetches data and converts to daily forecast', async () => {
        const forecasts = await api.getForecasts(11.930191, 57.740614);
        const forecast = forecasts[1];
        expect(forecast.degrees).toBe(3.9);
        expect(forecast.precipitation).toBe(1.2);
        expect(forecast.symbol).toBe(WeatherSymbol.OVERCAST);
        expect(forecast.windSpeed).toBe(5.1);
        expect(forecast.windDirection).toBe(183);
      });
      it('fetches data and converts to nightly forecast', async () => {
        const forecasts = await api.getForecasts(11.930191, 57.740614);
        const forecast = forecasts[0];
        expect(forecast.degrees).toBe(2.5);
        expect(forecast.precipitation).toBe(0);
        expect(forecast.symbol).toBe(WeatherSymbol.CLOUDY_SKY_NIGHT);
        expect(forecast.windSpeed).toBe(3.2);
        expect(forecast.windDirection).toBe(185);
      });
      it('throws error if something goes wrong', async () => {
        fetchResponse = Promise.reject('Failz');
        try {
          api.getForecasts(11.930191, 57.740614);
        } catch (e) {
          expect(e).toEqual('Failz');
        }
      });
    });
  });
});
