import { vi } from 'vitest';
import { WeatherSymbol } from '../../shared/types';
import * as api from './Smhi.api';
import { generateSmhiData } from './test/test.data';

const defaultSmhiData = generateSmhiData();

describe('SmhiApi', () => {
  const sunriseSunset = {
    sunrise: new Date('2019-02-18T08:00:00Z'),
    sunset: new Date('2019-02-18T20:00:00Z'),
  };
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: () => Promise.resolve(defaultSmhiData) } as Response);
  });

  it('fetches data and converts to daily forecast', async () => {
    const forecasts = await api.getForecasts(11.930191, 57.740614, sunriseSunset);
    const forecast = forecasts[1];
    expect(forecast.degrees).toBe(3.9);
    expect(forecast.precipitation).toBe(1.2);
    expect(forecast.symbol).toBe(WeatherSymbol.CLOUDY_SKY);
    expect(forecast.windSpeed).toBe(5.1);
    expect(forecast.windDirection).toBe(183);
  });
  it('fetches data and converts to nightly forecast', async () => {
    const forecasts = await api.getForecasts(11.930191, 57.740614, sunriseSunset);
    const forecast = forecasts[0];
    expect(forecast.degrees).toBe(2.5);
    expect(forecast.precipitation).toBe(0);
    expect(forecast.symbol).toBe(WeatherSymbol.CLOUDY_SKY_NIGHT);
    expect(forecast.windSpeed).toBe(3.2);
    expect(forecast.windDirection).toBe(185);
  });
  it('throws error if something goes wrong', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce('Failz');
    try {
      await api.getForecasts(11.930191, 57.740614, sunriseSunset);
    } catch (e) {
      expect(e).toEqual('Failz');
    }
  });
});
