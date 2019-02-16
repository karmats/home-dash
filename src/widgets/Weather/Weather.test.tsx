import 'jest';
import { WeatherSymbol } from './Weather.models';

describe('Weather models', () => {
  it('has all weather symbol files', () => {
    Object.keys(WeatherSymbol).forEach(symbol => {
      const fileName = `${WeatherSymbol[symbol as any]}.svg`;
      expect(require(`./svgs/animated/${fileName}`)).toBeDefined();
      expect(require(`./svgs/static/${fileName}`)).toBeDefined();
    });
  });
});
