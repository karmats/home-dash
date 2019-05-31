import 'jest';
import * as util from './Calendar.utils';

describe('Calendar', () => {
  describe('Utils', () => {
    it('creates a list of week dates', () => {
      const weekdays = util.getWeekDates(new Date('2019-03-27'));
      expect(weekdays.map(d => d.getDate())).toEqual([25, 26, 27, 28, 29, 30, 31]);
    });

    it('creates a list of week dates with start on sunday', () => {
      const weekdays = util.getWeekDates(new Date('2019-03-27'), false);
      expect(weekdays.map(d => d.getDate())).toEqual([24, 25, 26, 27, 28, 29, 30]);
    });

    it('creates a list of week dates when week overlaps month', () => {
      const weekdays = util.getWeekDates(new Date('2019-04-29'));
      expect(weekdays.map(d => d.getDate())).toEqual([29, 30, 1, 2, 3, 4, 5]);
    });
    it('creates a list of week dates when week overlaps year', () => {
      const weekdays = util.getWeekDates(new Date('2019-12-31'));
      expect(weekdays.map(d => d.getDate())).toEqual([30, 31, 1, 2, 3, 4, 5]);
    });
  });
});
