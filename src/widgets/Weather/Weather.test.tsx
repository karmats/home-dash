import 'jest';
import { WeatherSymbol } from './Weather.models';
import * as api from './apis/SmhiApi';
import * as util from './Weather.utils';

let fetchResponse: Promise<any> = Promise.resolve();
const mockFetch = jest.fn().mockImplementation(() => fetchResponse);
(global as any).fetch = mockFetch;

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
  describe('Apis', () => {
    describe('SMHI', () => {
      const smhiData = {
        approvedTime: '2019-02-18T07:03:55Z',
        referenceTime: '2019-02-18T07:00:00Z',
        timeSeries: [
          {
            validTime: '2019-02-18T08:00:00Z',
            parameters: [
              {
                name: 'pmean',
                unit: 'kg/m2/h',
                values: [1.2]
              },
              {
                name: 't',
                unit: 'Cel',
                values: [3.9]
              },
              {
                name: 'wd',
                unit: 'degree',
                values: [183]
              },
              {
                name: 'ws',
                unit: 'm/s',
                values: [5.1]
              },
              {
                name: 'Wsymb2',
                unit: 'category',
                values: [6]
              }
            ]
          }
        ]
      };
      it('fetches data and converts to forecast', async () => {
        fetchResponse = Promise.resolve({ json: () => Promise.resolve(smhiData) });
        const forecasts = await api.getForecasts(11.930191, 57.740614);
        const forecast = forecasts[0];
        expect(forecast.degrees).toBe(3.9);
        expect(forecast.precipitation).toBe(1.2);
        expect(forecast.symbol).toBe(WeatherSymbol.OVERCAST);
        expect(forecast.windSpeed).toBe(5.1);
        expect(forecast.windDirection).toBe(183);
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
