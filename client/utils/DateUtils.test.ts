import * as util from './DateUtils';

describe('DateUtils', () => {
  it('converts date to hours and minutes', () => {
    const d = new Date();
    d.setHours(2);
    d.setMinutes(5);
    expect(util.dateToTime(d)).toBe('02:05');
    d.setHours(15);
    d.setMinutes(32);
    expect(util.dateToTime(d)).toBe('15:32');
  });

  it('converts date to time ago string', () => {
    const d = new Date();
    d.setHours(2);
    d.setMinutes(5);

    expect(util.timeAgo(d)).toBe('idag kl. 02:05');
  });
});
