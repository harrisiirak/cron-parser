import { CronDate, TimeUnit } from '../src/CronDate';
import { DateTime } from 'luxon';

describe('CronDate', () => {
  test('is the last weekday of the month', () => {
    // Last monday of september
    const date1 = new CronDate(new Date(2021, 8, 27));
    expect(date1.isLastWeekdayOfMonth()).toBe(true);

    // Second-to-last monday of september
    const date2 = new CronDate(new Date(2021, 8, 20));
    expect(date2.isLastWeekdayOfMonth()).toBe(false);
  });

  test('addSecond should succeed', () => {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.addSecond();
    expect(date1.getMonth()).toBe(11);
    expect(date1.getDate()).toBe(30);
    expect(date1.getMinutes()).toBe(59);
    expect(date1.getSeconds()).toBe(59);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addSecond();
    expect(date2.getFullYear()).toBe(2022);
    expect(date2.getMonth()).toBe(0);
    expect(date2.getDate()).toBe(1);
    expect(date2.getMinutes()).toBe(0);
    expect(date2.getSeconds()).toBe(0);
  });

  test('addMinute should succeed', () => {
    const date1 = new CronDate(new Date('2021-12-30T00:58:58.000-00:00'), 'UTC');
    date1.addMinute();
    expect(date1.getMonth()).toBe(11);
    expect(date1.getDate()).toBe(30);
    expect(date1.getMinutes()).toBe(59);
    expect(date1.getSeconds()).toBe(0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addMinute();
    expect(date2.getFullYear()).toBe(2022);
    expect(date2.getMonth()).toBe(0);
    expect(date2.getDate()).toBe(1);
    expect(date2.getMinutes()).toBe(0);
    expect(date2.getSeconds()).toBe(0);
  });

  test('addHour should succeed', () => {
    const date1 = new CronDate(new Date('2021-12-30T00:58:58.000-00:00'), 'UTC');
    date1.addHour();
    expect(date1.getMonth()).toBe(11);
    expect(date1.getDate()).toBe(30);
    expect(date1.getHours()).toBe(1);
    expect(date1.getMinutes()).toBe(0);
    expect(date1.getSeconds()).toBe(0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addHour();
    expect(date2.getFullYear()).toBe(2022);
    expect(date2.getMonth()).toBe(0);
    expect(date2.getDate()).toBe(1);
    expect(date2.getHours()).toBe(0);
    expect(date2.getMinutes()).toBe(0);
    expect(date2.getSeconds()).toBe(0);
  });

  test('addDay should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:58:58.000-00:00'), 'UTC');
    date1.addDay();
    expect(date1.getMonth()).toEqual(11);
    expect(date1.getDate()).toEqual(31);
    expect(date1.getHours()).toEqual(0);
    expect(date1.getMinutes()).toEqual(0);
    expect(date1.getSeconds()).toEqual(0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addDay();
    expect(date2.getFullYear()).toEqual(2022);
    expect(date2.getMonth()).toEqual(0);
    expect(date2.getDate()).toEqual(1);
    expect(date2.getHours()).toEqual(0);
    expect(date2.getMinutes()).toEqual(0);
    expect(date2.getSeconds()).toEqual(0);
  });

  test('addMonth should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-11-30T00:58:58.000-00:00'), 'UTC');
    date1.addMonth();
    expect(date1.getMonth()).toEqual(11);
    expect(date1.getDate()).toEqual(1);
    expect(date1.getHours()).toEqual(0);
    expect(date1.getMinutes()).toEqual(0);
    expect(date1.getSeconds()).toEqual(0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addMonth();
    expect(date2.getFullYear()).toEqual(2022);
    expect(date2.getMonth()).toEqual(0);
    expect(date2.getDate()).toEqual(1);
    expect(date2.getHours()).toEqual(0);
    expect(date2.getMinutes()).toEqual(0);
    expect(date2.getSeconds()).toEqual(0);
  });

  test('addYear should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-11-30T00:58:58.000-00:00'), 'UTC');
    date1.addYear();
    expect(date1.getFullYear()).toEqual(2022);
    expect(date1.getMonth()).toEqual(10);
    expect(date1.getDate()).toEqual(30);
    expect(date1.getHours()).toEqual(0);
    expect(date1.getMinutes()).toEqual(58);
    expect(date1.getSeconds()).toEqual(58);

    const date2 = new CronDate(new Date('2020-02-29T23:59:59.000-00:00'), 'UTC');
    date2.addYear();
    expect(date2.getFullYear()).toEqual(2021);
    expect(date2.getMonth()).toEqual(1);
    expect(date2.getDate()).toEqual(28);
    expect(date2.getHours()).toEqual(23);
    expect(date2.getMinutes()).toEqual(59);
    expect(date2.getSeconds()).toEqual(59);
  });

  test('subtractSecond should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-12-30T00:59:59.000-00:00'), 'UTC');
    date1.subtractSecond();
    expect(date1.getFullYear()).toEqual(2020);
    expect(date1.getMonth()).toEqual(11);
    expect(date1.getDate()).toEqual(30);
    expect(date1.getMinutes()).toEqual(59);
    expect(date1.getSeconds()).toEqual(58);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractSecond();
    expect(date2.getFullYear()).toEqual(2019);
    expect(date2.getMonth()).toEqual(11);
    expect(date2.getDate()).toEqual(31);
    expect(date2.getMinutes()).toEqual(59);
    expect(date2.getSeconds()).toEqual(59);
  });

  test('subtractMinute should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-12-30T00:59:59.000-00:00'), 'UTC');
    date1.subtractMinute();
    expect(date1.getFullYear()).toEqual(2020);
    expect(date1.getMonth()).toEqual(11);
    expect(date1.getDate()).toEqual(30);
    expect(date1.getMinutes()).toEqual(58);
    expect(date1.getSeconds()).toEqual(59);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractMinute();
    expect(date2.getFullYear()).toEqual(2019);
    expect(date2.getMonth()).toEqual(11);
    expect(date2.getDate()).toEqual(31);
    expect(date2.getMinutes()).toEqual(59);
    expect(date2.getSeconds()).toEqual(59);
  });

  test('subtractHour should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-12-30T01:59:59.000-00:00'), 'UTC');
    date1.subtractHour();
    expect(date1.getFullYear()).toEqual(2020);
    expect(date1.getMonth()).toEqual(11);
    expect(date1.getDate()).toEqual(30);
    expect(date1.getHours()).toEqual(0);
    expect(date1.getMinutes()).toEqual(59);
    expect(date1.getSeconds()).toEqual(59);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractHour();
    expect(date2.getFullYear()).toEqual(2019);
    expect(date2.getMonth()).toEqual(11);
    expect(date2.getDate()).toEqual(31);
    expect(date2.getHours()).toEqual(23);
    expect(date2.getMinutes()).toEqual(59);
    expect(date2.getSeconds()).toEqual(59);
  });

  test('subtractDay should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-12-30T01:59:59.000-00:00'), 'UTC');
    date1.subtractDay();
    expect(date1.getFullYear()).toEqual(2020);
    expect(date1.getMonth()).toEqual(11);
    expect(date1.getDate()).toEqual(29);
    expect(date1.getHours()).toEqual(23);
    expect(date1.getMinutes()).toEqual(59);
    expect(date1.getSeconds()).toEqual(59);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractDay();
    expect(date2.getFullYear()).toEqual(2019);
    expect(date2.getMonth()).toEqual(11);
    expect(date2.getDate()).toEqual(31);
    expect(date2.getHours()).toEqual(23);
    expect(date2.getMinutes()).toEqual(59);
    expect(date2.getSeconds()).toEqual(59);
  });

  test('subtractYear should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-12-30T01:59:59.000-00:00'), 'UTC');
    date1.subtractYear();
    expect(date1.getFullYear()).toEqual(2019);
    expect(date1.getMonth()).toEqual(11);
    expect(date1.getDate()).toEqual(30);
    expect(date1.getHours()).toEqual(1);
    expect(date1.getMinutes()).toEqual(59);
    expect(date1.getSeconds()).toEqual(59);

    const date2 = new CronDate(new Date('2020-02-29T00:00:00.000-00:00'), 'UTC');
    date2.subtractYear();
    expect(date2.getFullYear()).toEqual(2019);
    expect(date2.getMonth()).toEqual(1);
    expect(date2.getDate()).toEqual(28);
    expect(date2.getHours()).toEqual(0);
    expect(date2.getMinutes()).toEqual(0);
    expect(date2.getSeconds()).toEqual(0);
  });

  test('addUnit should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date1.addUnit(TimeUnit.Year);
    expect(date1.getFullYear()).toEqual(2021);
    const date2 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date2.addUnit(TimeUnit.Month);
    expect(date2.getMonth()).toEqual(11);
    const date3 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date3.addUnit(TimeUnit.Day);
    expect(date3.getDate()).toEqual(1);
    const date4 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date4.addUnit(TimeUnit.Hour);
    expect(date4.getHours()).toEqual(2);
    const date5 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date5.addUnit(TimeUnit.Minute);
    expect(date5.getMinutes()).toEqual(2);
    const date6 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date6.addUnit(TimeUnit.Second);
    expect(date6.getSeconds()).toEqual(2);
  });

  test('subtractUnit should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date1.subtractUnit(TimeUnit.Year);
    expect(date1.getFullYear()).toEqual(2019);
    const date2 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date2.subtractUnit(TimeUnit.Month);
    expect(date2.getMonth()).toEqual(9);
    const date3 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date3.subtractUnit(TimeUnit.Day);
    expect(date3.getDate()).toEqual(29);
    const date4 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date4.subtractUnit(TimeUnit.Hour);
    expect(date4.getHours()).toEqual(0);
    const date5 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date5.subtractUnit(TimeUnit.Minute);
    expect(date5.getMinutes()).toEqual(0);
    const date6 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date6.subtractUnit(TimeUnit.Second);
    expect(date6.getSeconds()).toEqual(0);
  });

  test('getUTCDate should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    expect(date1.getUTCDate()).toEqual(30);
  });

  test('getUTCDay should succeed', ()=> {
    // Day of week starts at 0 for Sunday
    const date1 = new CronDate(new Date('2020-11-28T01:01:01.000-00:00'), 'UTC');
    expect(date1.getUTCDay()).toEqual(6);
    const date2 = new CronDate(new Date('2020-11-22T01:01:01.000-00:00'), 'UTC');
    expect(date2.getUTCDay()).toEqual(0);
    const date3 = new CronDate(new Date('2020-11-29T01:01:01.000-00:00'), 'UTC');
    expect(date3.getUTCDay()).toEqual(0);
  });

  test('getUTCFullYear should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    expect(date1.getUTCFullYear()).toEqual(2020);
  });

  test('getUTCMonth should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    expect(date1.getUTCMonth()).toEqual(10);
  });

  test('getUTCHours should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    expect(date1.getUTCHours()).toEqual(1);
  });

  test('getUTCMinutes should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    expect(date1.getUTCMinutes()).toEqual(1);
  });

  test('getUTCSeconds should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    expect(date1.getUTCSeconds()).toEqual(1);
  });

  test('toJSON should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    expect(date1.toJSON()).toEqual('2020-11-30T01:01:01.000Z');
  });

  test('toString should succeed', ()=> {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    const expected = new Date('2020-11-30T01:01:01.000-00:00').toString();
    expect(date1.toString()).toEqual(expected);
  });

  test('setDate should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setDate(1);
    expect(date1.getDate()).toEqual(1);
  });

  test('setFullYear should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setFullYear(2222);
    expect(date1.getFullYear()).toEqual(2222);
  });

  test('setDay should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setDay(3);
    expect(date1.getDay()).toEqual(3);
  });

  test('setMonth should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setMonth(3);
    expect(date1.getMonth()).toEqual(3);
  });

  test('setHours should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setHours(3);
    expect(date1.getHours()).toEqual(3);
  });

  test('setMinutes should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setMinutes(30);
    expect(date1.getMinutes()).toEqual(30);
  });

  test('setSeconds should succeed', ()=> {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setSeconds(30);
    expect(date1.getSeconds()).toEqual(30);
  });

  describe('parse cron date formats with local timezone', () => {
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = offset % 60;
    const offsetSign = offset < 0 ? '-' : '+';
    const expectedTime = new Date(2021, 0, 4, 10, 0, 0).toString();

    test('undefined date', () => {
      const realDate = new Date();
      const d = new CronDate();
      expect(d).toBeInstanceOf(CronDate);
      expect(d.toDate().toString()).toBe(realDate.toString());
    });

    test('JS Date', () => {
      const d = new CronDate(new Date(2021, 0, 4, 10, 0, 0));
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('ISO 8601', () => {
      const d = new CronDate('2021-01-04T10:00:00');
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('ISO 8601 date', () => {
      const d = new CronDate('2021-01-04');
      const expectedTime = new Date(2021, 0, 4, 0, 0, 0).toString();
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('RFC2822', () => {
      const offsetString = offsetSign + String(offsetHours).padStart(2, '0') + String(offsetMinutes).padStart(2, '0');
      const d = new CronDate('Mon, 4 Jan 2021 10:00:00 ' + offsetString);
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('RFC2822-like without timezone offset', () => {
      const d = new CronDate('Mon, 4 Jan 2021 10:00:00');
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('SQL', () => {
      const d = new CronDate('2021-01-04 10:00:00');
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('milliseconds', () => {
      const d = new CronDate(new Date('2021-01-04 10:00:00').valueOf());
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('CronDate', () => {
      const date = new CronDate('Mon, 4 Jan 2021 10:00:00');
      const d = new CronDate(date);
      expect(d.toDate().toString()).toBe(expectedTime);
    });

    test('invalid', () => {
      expect(() => new CronDate('2021-01-4 10:00:00')).toThrow();
    });
  });

  describe('parse cron date formats with another timezone', () => {
    test('ISO 8601 without offset', () => {
      const d = new CronDate('2021-01-04T10:00:00', 'Europe/Athens');
      expect(d.toISOString()).toBe('2021-01-04T08:00:00.000Z');
    });

    test('ISO 8601 with non-local offset', () => {
      const d = new CronDate('2021-01-04T10:00:00+01:00', 'Europe/Athens');
      expect(d.toISOString()).toBe('2021-01-04T09:00:00.000Z');
    });

    test('RFC2822 with non-local offset', () => {
      const d = new CronDate('Mon, 4 Jan 2021 10:00:00 +0100', 'Europe/Athens');
      expect(d.toISOString()).toBe('2021-01-04T09:00:00.000Z');
    });

    test('milliseconds', () => {
      const date = DateTime.fromISO('2021-01-04T11:00:00.000+02:00').valueOf();
      const d = new CronDate(date, 'Europe/Athens');
      expect(d.toISOString()).toBe('2021-01-04T09:00:00.000Z');
    });

    test('with same timezone', () => {
      const date = new CronDate('Mon, 4 Jan 2021 10:00:00', 'Europe/Athens');
      const d = new CronDate(date);
      expect(d.toISOString()).toBe('2021-01-04T08:00:00.000Z');
    });

    test('with different timezone', () => {
      const date = new CronDate('Mon, 4 Jan 2021 10:00:00', 'America/New_York');
      const d = new CronDate(date, 'Europe/Athens');
      expect(d.toISOString()).toBe('2021-01-04T15:00:00.000Z');
    });
  });
});
