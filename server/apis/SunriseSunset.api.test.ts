import { vi } from 'vitest';
import * as api from './SunriseSunset.api';
import { genereateSunriseSunsetData } from './test/test.data';

const defaultSunriseSunsetData = genereateSunriseSunsetData();

describe('SunriseSunsetApi', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(defaultSunriseSunsetData) } as Response);
  });

  it('fetches date an converts to sunrise sunset dates', async () => {
    const sunriseSunset = await api.getSunriseSunset(11.930191, 57.740614);
    expect(sunriseSunset.sunrise).toBeInstanceOf(Date);
    expect(sunriseSunset.sunset).toBeInstanceOf(Date);
  });

  it('throws data if status is not OK', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve(genereateSunriseSunsetData('INVALID_REQUEST')),
    } as Response);
    try {
      await api.getSunriseSunset(11.930191, 57.740614);
    } catch (e) {
      expect(e).toBeInstanceOf(Object);
    }
  });

  it('throws error if something goes wrong', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce('Failz');
    try {
      await api.getSunriseSunset(11.930191, 57.740614);
    } catch (e) {
      expect(e).toEqual('Failz');
    }
  });
});
