import 'jest';
import { isDay } from './DateUtils';

describe('DateUtils', () => {
  describe('isDay', () => {
    it('is day', () => {
      const d = new Date();
      d.setHours(6);
      expect(isDay(d)).toBe(true);
      d.setHours(15);
      expect(isDay(d)).toBe(true);
      d.setHours(22);
      expect(isDay(d)).toBe(true);
    });
    it('is not day', () => {
      const d = new Date();
      d.setHours(0);
      expect(isDay(d)).toBe(false);
      d.setHours(3);
      expect(isDay(d)).toBe(false);
      d.setHours(5);
      expect(isDay(d)).toBe(false);
    });
  });
});
