import 'jest';
import { genereateSunriseSunsetData } from './test/test.data';
import * as api from './SunriseSunsetApi';

let mockResponse: Promise<any> = Promise.resolve();
jest.mock('node-fetch', () => ({
  __esModule: true,
  default: () => mockResponse
}));
const defaultSunriseSunsetData = genereateSunriseSunsetData();

describe('SunriseSunsetApi', () => {
  beforeEach(() => {
    mockResponse = Promise.resolve({ json: () => Promise.resolve(defaultSunriseSunsetData) });
  });

  it('fetches date an converts to sunrise sunset dates', async () => {
    const sunriseSunset = await api.getSunriseSunset(11.930191, 57.740614);
    expect(sunriseSunset.sunrise).toBeInstanceOf(Date);
    expect(sunriseSunset.sunset).toBeInstanceOf(Date);
  });

  it('throws data if status is not OK', async () => {
    mockResponse = Promise.resolve({
      json: () => Promise.resolve(genereateSunriseSunsetData('INVALID_REQUEST'))
    });
    try {
      await api.getSunriseSunset(11.930191, 57.740614);
    } catch (e) {
      expect(e).toBeInstanceOf(Object);
    }
  });

  it('throws error if something goes wrong', async () => {
    mockResponse = Promise.reject('Failz');
    try {
      await api.getSunriseSunset(11.930191, 57.740614);
    } catch (e) {
      expect(e).toEqual('Failz');
    }
  });
});
