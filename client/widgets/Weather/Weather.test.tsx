import 'jest';
import React from 'react';
import { render, cleanup, waitForElement, act } from 'react-testing-library';
import * as smhiApi from './apis/SmhiApi';
import * as sunriseSunsetApi from './apis/SunriseSunsetApi';
import { WeatherSymbol } from './Weather.models';
import * as util from './Weather.utils';
import Weather from './Weather';
import { generateSmhiData, genereateSunriseSunsetData } from './Weather.test.data';

// Mocks
jest.mock('react-svg');

const mockGeolocation = {
  getCurrentPosition: jest.fn(success =>
    success({ coords: { latitude: 57.740614, longitude: 11.930191 }, timestamp: new Date().getTime() })
  )
};
(global as any).navigator.geolocation = mockGeolocation;

let smhiResponse: Promise<any> = Promise.resolve();
let sunriseSunsetResponse: Promise<any> = Promise.resolve();
const mockFetch = jest.fn((url: string) => {
  if (url.startsWith(smhiApi.BASE_URL)) {
    return smhiResponse;
  } else if (url.startsWith(sunriseSunsetApi.BASE_URL)) {
    return sunriseSunsetResponse;
  }
  console.error(`No response found for url '${url}'`);
});
(global as any).fetch = mockFetch;

const defaultSmhiData = generateSmhiData();
const defaultSunriseSunsetData = genereateSunriseSunsetData();

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
    const smhiData = {
      mainTemp: 3
    };
    beforeEach(() => {
      smhiResponse = Promise.resolve({ json: () => Promise.resolve(generateSmhiData(smhiData.mainTemp)) });
      sunriseSunsetResponse = Promise.resolve({ json: () => Promise.resolve(defaultSunriseSunsetData) });
    });
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
  describe('Apis', () => {
    describe('sunrise-sunset', () => {
      beforeEach(() => {
        sunriseSunsetResponse = Promise.resolve({ json: () => Promise.resolve(defaultSunriseSunsetData) });
      });

      it('fetches date an converts to sunrise sunset dates', async () => {
        const sunriseSunset = await sunriseSunsetApi.getSunriseSunset(11.930191, 57.740614);
        expect(sunriseSunset.sunrise).toBeInstanceOf(Date);
        expect(sunriseSunset.sunset).toBeInstanceOf(Date);
      });

      it('throws data if status is not OK', async () => {
        sunriseSunsetResponse = Promise.resolve({ json: () => Promise.resolve(genereateSunriseSunsetData('INVALID_REQUEST')) });
        try {
          await sunriseSunsetApi.getSunriseSunset(11.930191, 57.740614);
        } catch (e) {
          expect(e).toBeInstanceOf(Object);
        }
      });

      it('throws error if something goes wrong', async () => {
        sunriseSunsetResponse = Promise.reject('Failz');
        try {
          await sunriseSunsetApi.getSunriseSunset(11.930191, 57.740614);
        } catch (e) {
          expect(e).toEqual('Failz');
        }
      });
    });
    describe('SMHI', () => {
      const sunriseSunset = {
        sunrise: new Date('2019-02-18T08:00:00Z'),
        sunset: new Date('2019-02-18T20:00:00Z')
      };
      beforeEach(() => {
        smhiResponse = Promise.resolve({ json: () => Promise.resolve(defaultSmhiData) });
      });

      it('fetches data and converts to daily forecast', async () => {
        const forecasts = await smhiApi.getForecasts(11.930191, 57.740614, sunriseSunset);
        const forecast = forecasts[1];
        expect(forecast.degrees).toBe(3.9);
        expect(forecast.precipitation).toBe(1.2);
        expect(forecast.symbol).toBe(WeatherSymbol.CLOUDY_SKY);
        expect(forecast.windSpeed).toBe(5.1);
        expect(forecast.windDirection).toBe(183);
      });
      it('fetches data and converts to nightly forecast', async () => {
        const forecasts = await smhiApi.getForecasts(11.930191, 57.740614, sunriseSunset);
        const forecast = forecasts[0];
        expect(forecast.degrees).toBe(2.5);
        expect(forecast.precipitation).toBe(0);
        expect(forecast.symbol).toBe(WeatherSymbol.CLOUDY_SKY_NIGHT);
        expect(forecast.windSpeed).toBe(3.2);
        expect(forecast.windDirection).toBe(185);
      });
      it('throws error if something goes wrong', async () => {
        smhiResponse = Promise.reject('Failz');
        try {
          await smhiApi.getForecasts(11.930191, 57.740614, sunriseSunset);
        } catch (e) {
          expect(e).toEqual('Failz');
        }
      });
    });
  });
});
