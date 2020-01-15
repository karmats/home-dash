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

    it('from and to should be monday and sunday', () => {
      const { from, to } = util.getCurrentWeekStartAndEnd();
      expect(from.getDay()).toBe(1);
      expect(to.getDay()).toBe(0);
    });

    it('from and to should be sunday and saturday', () => {
      const { from, to } = util.getCurrentWeekStartAndEnd(false);
      expect(from.getDay()).toBe(0);
      expect(to.getDay()).toBe(6);
    });

    it('is same date', () => {
      const date1 = new Date('2020-01-01T20:44:54.062Z');
      const date2 = new Date('2020-01-01T06:12:22.041Z');
      expect(util.isSameDay(date1, date2)).toBe(true);
    });

    it('is not same date', () => {
      const date1 = new Date('2020-01-01T20:44:54.062Z');
      const date2 = new Date('2020-01-02T06:12:22.041Z');
      expect(util.isSameDay(date1, date2)).toBe(false);
    });

    it('converts to time', () => {
      const date1 = new Date('2020-01-01T20:44:54');
      const date2 = new Date('2020-01-01T01:09:54');
      expect(util.getDateAsTimeString(date1)).toBe('20:44');
      expect(util.getDateAsTimeString(date2)).toBe('01:09');
    });

    it('is today', () => {
      expect(util.isToday(new Date())).toBe(true);
    });
    it('is not today', () => {
      expect(util.isToday(new Date('2019-01-10'))).toBe(false);
    });
  });
});
