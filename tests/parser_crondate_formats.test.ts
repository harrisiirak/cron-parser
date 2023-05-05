import { CronDate } from '../src';
import { DateTime } from 'luxon';

describe('parse cron date formats with local timezone', () => {
  const offset = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offset / 60));
  const offsetMinutes = offset % 60;
  const offsetSign = offset < 0 ? '-' : '+';
  const expectedTime = new Date(2021, 0, 4, 10, 0, 0).toString();
  const typeCheckCronDate = (date: unknown) => {
    if (!(date instanceof CronDate)) {
      throw new Error('date is not instance of CronDate');
    }
  };

  test('undefined date', () => {
    // FIXME: this test can fail sometimes due to being off by 1 second
    const realDate = new Date();
    const d = new CronDate();
    typeCheckCronDate(d);
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

  // FIXME? THIS TEST MUST BE RAN WITH TZ=UTC!!!
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

  test('CronDate with same timezone', () => {
    const date = new CronDate('Mon, 4 Jan 2021 10:00:00', 'Europe/Athens');
    const d = new CronDate(date);
    expect(d.toISOString()).toBe('2021-01-04T08:00:00.000Z');
  });

  test('CronDate with different timezone', () => {
    const date = new CronDate('Mon, 4 Jan 2021 10:00:00', 'America/New_York');
    const d = new CronDate(date, 'Europe/Athens');
    expect(d.toISOString()).toBe('2021-01-04T15:00:00.000Z');
  });
});

