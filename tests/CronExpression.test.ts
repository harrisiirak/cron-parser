import {
  CronExpression,
  CronExpressionOptions,
  LOOPS_LIMIT_EXCEEDED_ERROR_MESSAGE,
  TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE,
} from '../src/CronExpression';
import { CronDate, TimeUnit } from '../src/CronDate';
import { CronFieldCollection, CronFields } from '../src/CronFieldCollection';
import { expect } from '@jest/globals';
import { CronDayOfMonth, CronDayOfWeek, CronHour, CronMinute, CronMonth, CronSecond } from '../src/fields';
import CronExpressionParser from '../src';

describe('CronExpression', () => {
  let fields: CronFieldCollection;
  let options: CronExpressionOptions;

  beforeEach(() => {
    fields = new CronFieldCollection({
      second: new CronSecond([0]),
      minute: new CronMinute([0]),
      hour: new CronHour([0]),
      month: new CronMonth([1]),
      dayOfMonth: new CronDayOfMonth([1]),
      dayOfWeek: new CronDayOfWeek([0, 7]),
    });
    options = {
      currentDate: new Date('2023-01-01T00:00:00Z'),
    };
  });

  test('should create a new CronExpression instance', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression).toBeInstanceOf(CronExpression);
  });

  test('should return the next scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    const nextDate = cronExpression.next();
    expect(nextDate.toISOString()).toBe('2023-01-08T00:00:00.000Z');
  });

  test('should return the previous scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    const prevDate = cronExpression.prev();
    expect(prevDate.toISOString()).toBe('2022-01-30T00:00:00.000Z');
  });

  test('should check if there is a next scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression.hasNext()).toBe(true);
  });

  test('should check if there is a previous scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression.hasPrev()).toBe(true);
  });

  test('should take a specified number of steps forward', () => {
    const cronExpression = new CronExpression(fields, options);
    const dates = cronExpression.take(3);
    expect(dates.length).toBe(3);
  });

  test('should take a specified number of steps backward', () => {
    const cronExpression = new CronExpression(fields, options);
    const dates = cronExpression.take(-3);
    expect(dates.length).toBe(3);
  });

  test('should reset the current date to a new date', () => {
    const cronExpression = new CronExpression(fields, options);
    const newDate = new Date('2023-01-01T00:00:00Z');

    let nextDate = cronExpression.next().toISOString();
    expect(nextDate).toBe('2023-01-08T00:00:00.000Z');

    cronExpression.reset(newDate);
    nextDate = cronExpression.next().toISOString();
    expect(nextDate).toBe('2023-01-08T00:00:00.000Z');
  });

  test('should return the string representation of the cron expression', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression.toString()).toBe('0 0 0 1 1 0');
  });

  test('should set milliseconds to 0 on next scheduled date (issue #363)', () => {
    const cronExpression = CronExpressionParser.parse('* * * * *', {
      currentDate: '2020-03-06T10:02:01.002Z',
    });
    const nextDate = cronExpression.next();
    expect(nextDate.toISOString()).toBe('2020-03-06T10:03:00.000Z');
  });

  test('should set milliseconds to 0 on previous scheduled date (issue #363)', () => {
    const cronExpression = CronExpressionParser.parse('* * * * *', {
      currentDate: '2020-03-06T10:02:01.002Z',
    });
    const prevDate = cronExpression.prev();
    expect(prevDate.toISOString()).toBe('2020-03-06T10:02:00.000Z');
  });

  describe('iteration jump flows', () => {
    let spy: jest.SpyInstance | undefined;

    afterEach(() => {
      spy?.mockRestore();
    });

    test('jumps to next allowed second without stepping via applyDateOperation()', () => {
      const interval = CronExpressionParser.parse('10,20 * * * * *', {
        currentDate: new Date('2023-01-01T00:00:12.000Z'),
      });

      spy = jest.spyOn(CronDate.prototype, 'applyDateOperation');
      const next = interval.next();
      expect(next.toISOString()).toBe('2023-01-01T00:00:20.000Z');
      expect(spy).not.toHaveBeenCalled();
    });

    test('jumps to previous allowed second without stepping via applyDateOperation()', () => {
      const interval = CronExpressionParser.parse('10,20 * * * * *', {
        currentDate: new Date('2023-01-01T00:00:18.000Z'),
      });

      spy = jest.spyOn(CronDate.prototype, 'applyDateOperation');
      const prev = interval.prev();
      expect(prev.toISOString()).toBe('2023-01-01T00:00:10.000Z');
      expect(spy).not.toHaveBeenCalled();
    });

    test('jumps to next allowed minute and resets seconds to minimum allowed', () => {
      const interval = CronExpressionParser.parse('0 10,20 * * * *', {
        currentDate: new Date('2023-01-01T00:12:30.000Z'),
      });

      spy = jest.spyOn(CronDate.prototype, 'applyDateOperation');
      const next = interval.next();
      expect(next.toISOString()).toBe('2023-01-01T00:20:00.000Z');
      expect(spy).not.toHaveBeenCalled();
    });

    test('when there is no later allowed minute, rolls to next hour then sets minute/second', () => {
      const interval = CronExpressionParser.parse('0 10 * * * *', {
        currentDate: new Date('2023-01-01T00:59:30.000Z'),
      });

      spy = jest.spyOn(CronDate.prototype, 'applyDateOperation');
      const next = interval.next();
      expect(next.toISOString()).toBe('2023-01-01T01:10:00.000Z');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][1]).toBe(TimeUnit.Hour);
    });

    test('when past the last scheduled hour for the day, jumps a full day first', () => {
      const interval = CronExpressionParser.parse('0 0 9 * * *', {
        currentDate: new Date('2023-01-01T10:00:00.000Z'),
      });

      spy = jest.spyOn(CronDate.prototype, 'applyDateOperation');
      const next = interval.next();
      expect(next.toISOString()).toBe('2023-01-02T09:00:00.000Z');
      expect(spy.mock.calls.filter((c) => c[1] === TimeUnit.Day)).toHaveLength(1);
      expect(spy.mock.calls.filter((c) => c[1] === TimeUnit.Hour)).toHaveLength(0);
    });

    test('jumps to next allowed hour without stepping via applyDateOperation()', () => {
      const interval = CronExpressionParser.parse('0 0 5,10 * * *', {
        currentDate: new Date('2023-01-01T06:00:00.000Z'),
      });

      spy = jest.spyOn(CronDate.prototype, 'applyDateOperation');
      const next = interval.next();
      expect(next.toISOString()).toBe('2023-01-01T10:00:00.000Z');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('iteration exclusivity', () => {
    test('when currentDate is exactly on a schedule, returns the next occurrence', () => {
      const interval = CronExpressionParser.parse('0 0 9 * * *', {
        currentDate: new Date('2023-01-01T09:00:00.000Z'),
      });
      expect(interval.next().toISOString()).toBe('2023-01-02T09:00:00.000Z');
    });

    test('when currentDate is exactly on a schedule, returns the previous occurrence', () => {
      const interval = CronExpressionParser.parse('0 0 9 * * *', {
        currentDate: new Date('2023-01-01T09:00:00.000Z'),
      });
      expect(interval.prev().toISOString()).toBe('2022-12-31T09:00:00.000Z');
    });
  });

  describe('next schedule bounds validation', () => {
    test('should use startDate as currentDate when currentDate is not provided', () => {
      const cronExpression = new CronExpression(fields, {
        startDate: '2022-01-01T00:00:00Z',
      });

      const nextDate = cronExpression.next();
      expect(nextDate.toISOString()).toBe('2022-01-02T00:00:00.000Z');
    });

    test('should clamp currentDate to startDate when currentDate is before startDate', () => {
      const cronExpression = new CronExpression(fields, {
        currentDate: '2021-01-01T00:00:00Z',
        startDate: '2022-01-01T00:00:00Z',
      });

      const nextDate = cronExpression.next();
      expect(nextDate.toISOString()).toBe('2022-01-02T00:00:00.000Z');
    });

    test('should clamp currentDate to endDate when currentDate is after endDate', () => {
      const cronExpression = new CronExpression(fields, {
        currentDate: '2023-01-01T00:00:00Z',
        endDate: '2022-01-01T00:00:00Z',
      });

      const prevDate = cronExpression.prev();
      expect(prevDate.toISOString()).toBe('2021-01-31T00:00:00.000Z');
    });

    test('should retain the current date when it is within the bounds', () => {
      const cronExpression = new CronExpression(fields, {
        ...options,
        currentDate: '2023-01-01T00:00:00Z',
        startDate: '2022-01-01T00:00:00Z',
        endDate: '2024-01-01T00:00:00Z',
      });
      expect(() => cronExpression.next()).not.toThrow();
      expect(() => cronExpression.prev()).not.toThrow();
    });

    test('should throw an error if the current date is after end date', () => {
      const cronExpression = new CronExpression(fields, {
        ...options,
        currentDate: '2022-01-01T00:00:00Z',
        endDate: '2022-01-01T00:00:00Z',
      });

      expect(() => cronExpression.next()).toThrow(TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE);
    });

    test('should throw an error if the current date is before start date', () => {
      const cronExpression = new CronExpression(fields, {
        ...options,
        currentDate: '2022-01-01T00:00:00Z',
        startDate: '2022-01-01T00:00:00Z',
      });
      expect(() => cronExpression.prev()).toThrow(TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE);
    });
  });

  describe('stringify', () => {
    test('stringify cron expression all stars no seconds 0 * * * * *', () => {
      const expected = '0 * * * * *';
      const interval = CronExpressionParser.parse('* * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected); // `expected: ${expected}, actual: ${str}`;
    });

    test('stringify cron expression all stars no seconds (discard seconds)', () => {
      const expected = '* * * * *';
      const interval = CronExpressionParser.parse('* * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression all stars with seconds', () => {
      const expected = '* * * * * *';
      const interval = CronExpressionParser.parse('* * * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression all stars with seconds (discard seconds)', () => {
      const expected = '* * * * *';
      const interval = CronExpressionParser.parse('* * * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression', () => {
      const expected = '0 1,2,4-10,20-35/5,57 * * * *';
      const interval = CronExpressionParser.parse('1,2,4-10,20-35/5,57 * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression (discard seconds)', () => {
      const expected = '1,2,4-10,20-35/5,57 * * * *';
      const interval = CronExpressionParser.parse('1,2,4-10,20-35/5,57 * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with star range step', () => {
      const expected = '0 */5 */2 * * *';
      const interval = CronExpressionParser.parse('*/5 */2 */1 * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with multiple values and retain original value', () => {
      const expected = '0 * * * * 1,3,5';
      const interval = CronExpressionParser.parse('* * * * 1,3,5', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('correctly stringify cron expression * * * * 0,2,4 and convert value to range step', () => {
      const expected = '0 * * * * 0-4/2';
      const interval = CronExpressionParser.parse('* * * * 0,2,4', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('correctly stringify cron expression * * * * 0,2,4,6 convert value to */2 step', () => {
      const expected = '0 * * * * */2';
      const interval = CronExpressionParser.parse('* * * * 0,2,4,6', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('correctly stringify cron expression * * * * */2', () => {
      const expected = '0 * * * * */2';
      const interval = CronExpressionParser.parse('* * * * */2', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with star range step (discard seconds)', () => {
      const expected = '*/5 */2 * * *';
      const interval = CronExpressionParser.parse('*/5 */2 */1 * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with semi range step', () => {
      const expected = '0 5/5 * * * *';
      const interval = CronExpressionParser.parse('5/5 * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with semi range step (discard seconds)', () => {
      const expected = '5/5 * * * *';
      const interval = CronExpressionParser.parse('5/5 * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with L', () => {
      const expected = '0 * * 1,4-10,L * *';
      const interval = CronExpressionParser.parse('* * 1,4-10,L * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with L (discard seconds)', () => {
      const expected = '* * 1,4-10,L * *';
      const interval = CronExpressionParser.parse('* * 1,4-10,L * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with weekday L', () => {
      const expected = '0 0 0 * * 1L';
      const interval = CronExpressionParser.parse(expected, {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with multiple weekday, one of them with an L', () => {
      const expected = '0 0 0 * * 4,6L';
      const interval = CronExpressionParser.parse(expected, {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with multiple weekday, two of them with an L', () => {
      const expected = '0 0 0 * * 1L,5L';
      const interval = CronExpressionParser.parse(expected, {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronExpression.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with day of week #', () => {
      const expressions: string[] = [];
      for (let week = 1; week <= 5; week++) {
        for (let day = 0; day <= 6; day++) {
          expressions.push(`* * * * * ${day}#${week}`);
        }
      }

      for (const expression of expressions) {
        const interval = CronExpressionParser.parse(expression, {});
        const str = interval.stringify(true);
        expect(str).toEqual(expression);
      }
    });

    test('stringify cron expression with ?', () => {
      const expected = '? ? * * ?';
      const interval = CronExpressionParser.parse(expected, {});
      const str = interval.stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with wildcard day of month and single month value', () => {
      const expected = '* * * 4 *';
      const interval = CronExpressionParser.parse(expected, {});
      const str = interval.stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with wildcard day of month and month range', () => {
      const expected = '* * * 4-6 *';
      const interval = CronExpressionParser.parse(expected, {});
      const str = interval.stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with day of month range and single month value', () => {
      const expected = '* * 1-25 4 *';
      const interval = CronExpressionParser.parse(expected, {});
      const str = interval.stringify();
      expect(str).toEqual(expected);
    });

    test('stringify from fields out of order', () => {
      const expected = '1-5 1 1 1 1 1';
      const str = CronExpression.fieldsToExpression(
        new CronFieldCollection({
          second: new CronSecond([5, 2, 1, 4, 3]),
          minute: new CronMinute([1]),
          hour: new CronHour([1]),
          month: new CronMonth([1]),
          dayOfMonth: new CronDayOfMonth([1]),
          dayOfWeek: new CronDayOfWeek([1]),
        }),
      ).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify from fields out of order (discard seconds)', () => {
      const expected = '1 1 1 1 1';
      const str = CronExpression.fieldsToExpression(
        new CronFieldCollection({
          second: new CronSecond([5, 2, 1, 4, 3]),
          minute: new CronMinute([1]),
          hour: new CronHour([1]),
          month: new CronMonth([1]),
          dayOfMonth: new CronDayOfMonth([1]),
          dayOfWeek: new CronDayOfWeek([1]),
        }),
      ).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with extended day of week range (0,7)', () => {
      const expected = '* * * * *';
      const interval = CronExpressionParser.parse('* * * * *');

      let str = CronExpression.fieldsToExpression(
        new CronFieldCollection({
          second: interval.fields.second,
          minute: interval.fields.minute,
          hour: interval.fields.hour,
          month: interval.fields.month,
          dayOfMonth: interval.fields.dayOfMonth,
          dayOfWeek: new CronDayOfWeek([0, 1, 2, 3, 4, 5, 6]),
        }),
      ).stringify();
      expect(str).toEqual(expected);

      str = CronExpression.fieldsToExpression(
        new CronFieldCollection({
          second: interval.fields.second,
          minute: interval.fields.minute,
          hour: interval.fields.hour,
          month: interval.fields.month,
          dayOfMonth: interval.fields.dayOfMonth,
          dayOfWeek: new CronDayOfWeek([0, 1, 2, 3, 4, 5, 6, 7]),
        }),
      ).stringify();
      expect(str).toEqual(expected);
    });

    test('throw validation error - missing field (seconds)', () => {
      const input = <CronFields>{
        minute: new CronMinute([1]),
        hour: new CronHour([1]),
        month: new CronMonth([1]),
        dayOfMonth: new CronDayOfMonth([1]),
        dayOfWeek: new CronDayOfWeek([1]),
      };
      expect(() => CronExpression.fieldsToExpression(new CronFieldCollection(input))).toThrowError(
        'Validation error, Field second is missing',
      );
    });
  });

  describe('includesDate', () => {
    test('should check if the cron expression includes a given date', () => {
      const cronExpression = new CronExpression(fields, options);
      expect(cronExpression.includesDate(new Date('2023-01-01T00:00:00.000Z'))).toBeTruthy();
      expect(cronExpression.includesDate(new Date('2024-01-01T00:00:00.000Z'))).toBeTruthy();
      expect(cronExpression.includesDate(new Date('2024-02-01T00:00:00.000Z'))).toBeFalsy();
    });

    test('should support last weekday of month', () => {
      const cronExpression = CronExpressionParser.parse('0 0 0 * * 1L', {
        currentDate: new Date('2023-01-01T00:00:00Z'),
      });

      expect(cronExpression.includesDate(new Date('2023-01-30T00:00:00Z'))).toBeTruthy();
      expect(cronExpression.includesDate(new Date('2023-01-23T00:00:00Z'))).toBeFalsy();
      expect(cronExpression.includesDate(new Date('2023-01-31T00:00:00Z'))).toBeFalsy();
    });

    test('should support nth day of week', () => {
      const cronExpression = CronExpressionParser.parse('0 0 0 * * 1#3', {
        currentDate: new Date('2023-01-01T00:00:00Z'),
      });

      expect(cronExpression.includesDate(new Date('2023-01-02T00:00:00Z'))).toBeFalsy();
      expect(cronExpression.includesDate(new Date('2023-01-09T00:00:00Z'))).toBeFalsy();
      expect(cronExpression.includesDate(new Date('2023-01-16T00:00:00Z'))).toBeTruthy();
      expect(cronExpression.includesDate(new Date('2023-01-23T00:00:00Z'))).toBeFalsy();
    });
  });
});
