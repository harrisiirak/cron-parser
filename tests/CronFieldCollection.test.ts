import { CronFieldCollection } from '../src/CronFieldCollection';
import {
  CronSecond,
  CronMinute,
  CronHour,
  CronDayOfMonth,
  CronMonth,
  CronDayOfWeek,
  DayOfWeekRange,
  MonthRange,
  DayOfMonthRange,
  HourRange,
  SixtyRange,
} from '../src/fields';

describe('CronFieldCollection', () => {
  describe('getters', () => {
    test('should access fields and assert correct types', () => {
      const cronFields = new CronFieldCollection({
        second: new CronSecond([0]),
        minute: new CronMinute([0, 30]),
        hour: new CronHour([9]),
        dayOfMonth: new CronDayOfMonth([15]),
        month: new CronMonth([1]),
        dayOfWeek: new CronDayOfWeek([1, 2, 3, 4, 5]),
      });

      expect(cronFields.second).toBeInstanceOf(CronSecond);
      expect(cronFields.minute).toBeInstanceOf(CronMinute);
      expect(cronFields.hour).toBeInstanceOf(CronHour);
      expect(cronFields.dayOfMonth).toBeInstanceOf(CronDayOfMonth);
      expect(cronFields.month).toBeInstanceOf(CronMonth);
      expect(cronFields.dayOfWeek).toBeInstanceOf(CronDayOfWeek);
    });
  });

  describe('serialize', () => {
    test('should serialize collection', () => {
      const expected = {
        second: {
          wildcard: true,
          values: Array.from(Array(60).keys()),
        },
        minute: {
          wildcard: false,
          values: [0, 30],
        },
        hour: {
          wildcard: false,
          values: [9, 11, 13, 15, 17],
        },
        dayOfMonth: {
          wildcard: false,
          values: [1, 15],
        },
        month: {
          wildcard: false,
          values: [1, 3, 5, 7, 9, 11],
        },
        dayOfWeek: {
          wildcard: false,
          values: [1, 2, 3, 4, 5],
        },
      };
      const cronFields = new CronFieldCollection({
        second: new CronSecond(<SixtyRange[]>expected.second.values),
        minute: new CronMinute(<SixtyRange[]>expected.minute.values),
        hour: new CronHour(<HourRange[]>expected.hour.values),
        dayOfMonth: new CronDayOfMonth(<DayOfMonthRange[]>expected.dayOfMonth.values),
        month: new CronMonth(<MonthRange[]>expected.month.values),
        dayOfWeek: new CronDayOfWeek(<DayOfWeekRange[]>expected.dayOfWeek.values),
      });

      expect(cronFields.stringify()).toEqual('0,30 9-17/2 1,15 */2 1-5');
      expect(cronFields.stringify(true)).toEqual('* 0,30 9-17/2 1,15 */2 1-5');
      expect(cronFields.serialize()).toEqual(expected);
    });

    test('should serialize fields to an object', () => {
      const cronFields = new CronFieldCollection({
        second: new CronSecond([0]),
        minute: new CronMinute([0, 30]),
        hour: new CronHour([9]),
        dayOfMonth: new CronDayOfMonth([15]),
        month: new CronMonth([1]),
        dayOfWeek: new CronDayOfWeek([1, 2, 3, 4, 5]),
      });

      expect(cronFields.dayOfMonth.serialize()).toEqual({
        values: [15],
        wildcard: false,
      });
    });
  });

  describe('constructor validation', () => {
    test('should throw error when second field is missing', () => {
      expect(
        () =>
          new CronFieldCollection({
            minute: new CronMinute([0]),
            hour: new CronHour([12]),
            dayOfMonth: new CronDayOfMonth([1]),
            month: new CronMonth([1]),
            dayOfWeek: new CronDayOfWeek([1]),
          } as any),
      ).toThrow('Validation error, Field second is missing');
    });

    test('should throw error when minute field is missing', () => {
      expect(
        () =>
          new CronFieldCollection({
            second: new CronSecond([0]),
            hour: new CronHour([12]),
            dayOfMonth: new CronDayOfMonth([1]),
            month: new CronMonth([1]),
            dayOfWeek: new CronDayOfWeek([1]),
          } as any),
      ).toThrow('Validation error, Field minute is missing');
    });

    test('should throw error when hour field is missing', () => {
      expect(
        () =>
          new CronFieldCollection({
            second: new CronSecond([0]),
            minute: new CronMinute([0]),
            dayOfMonth: new CronDayOfMonth([1]),
            month: new CronMonth([1]),
            dayOfWeek: new CronDayOfWeek([1]),
          } as any),
      ).toThrow('Validation error, Field hour is missing');
    });

    test('should throw error when dayOfMonth field is missing', () => {
      expect(
        () =>
          new CronFieldCollection({
            second: new CronSecond([0]),
            minute: new CronMinute([0]),
            hour: new CronHour([12]),
            month: new CronMonth([1]),
            dayOfWeek: new CronDayOfWeek([1]),
          } as any),
      ).toThrow('Validation error, Field dayOfMonth is missing');
    });

    test('should throw error when month field is missing', () => {
      expect(
        () =>
          new CronFieldCollection({
            second: new CronSecond([0]),
            minute: new CronMinute([0]),
            hour: new CronHour([12]),
            dayOfMonth: new CronDayOfMonth([1]),
            dayOfWeek: new CronDayOfWeek([1]),
          } as any),
      ).toThrow('Validation error, Field month is missing');
    });

    test('should throw error when dayOfWeek field is missing', () => {
      expect(
        () =>
          new CronFieldCollection({
            second: new CronSecond([0]),
            minute: new CronMinute([0]),
            hour: new CronHour([12]),
            dayOfMonth: new CronDayOfMonth([1]),
            month: new CronMonth([1]),
          } as any),
      ).toThrow('Validation error, Field dayOfWeek is missing');
    });

    test('should throw error for invalid day of month definition', () => {
      expect(
        () =>
          new CronFieldCollection({
            second: new CronSecond([0]),
            minute: new CronMinute([0]),
            hour: new CronHour([12]),
            dayOfMonth: new CronDayOfMonth([31]), // February only has 28/29 days
            month: new CronMonth([2]), // February
            dayOfWeek: new CronDayOfWeek([1]),
          }),
      ).toThrow('Invalid explicit day of month definition');
    });
  });

  describe('CronFieldCollection.compactField', () => {
    test('empty array', () => {
      const result = CronFieldCollection.compactField([]);
      expect(result).toEqual([]);
    });

    test('single element array', () => {
      const result = CronFieldCollection.compactField([1]);
      expect(result).toEqual([{ start: 1, count: 1 }]);
    });

    test('2 elements array', () => {
      const result = CronFieldCollection.compactField([1, 2]);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 2, count: 1 },
      ]);
    });

    test('2 elements array big step', () => {
      const result = CronFieldCollection.compactField([1, 5]);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 5, count: 1 },
      ]);
    });

    test('3 elements array 1 step', () => {
      const result = CronFieldCollection.compactField([1, 2, 3]);
      expect(result).toEqual([{ start: 1, end: 3, count: 3, step: 1 }]);
    });

    test('3 elements array 1 step, dangling extra at end', () => {
      const result = CronFieldCollection.compactField([1, 2, 3, 5]);
      expect(result).toEqual([
        { start: 1, end: 3, count: 3, step: 1 },
        { start: 5, count: 1 },
      ]);
    });

    test('3 elements array 1 step, dangling extra at end and beginning', () => {
      const result = CronFieldCollection.compactField([1, 4, 5, 6, 9]);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 4, end: 6, count: 3, step: 1 },
        { start: 9, count: 1 },
      ]);
    });

    test('2 ranges with dangling in the middle', () => {
      const result = CronFieldCollection.compactField([1, 2, 3, 6, 9, 11, 13]);
      expect(result).toEqual([
        { start: 1, end: 3, count: 3, step: 1 },
        { start: 6, count: 1 },
        { start: 9, end: 13, count: 3, step: 2 },
      ]);
    });

    test('with chars', () => {
      const result = CronFieldCollection.compactField(['L', 'W']);
      expect(result).toEqual([
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);
    });

    test('with chars and range', () => {
      const result = CronFieldCollection.compactField([1, 'L', 'W']);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);
    });

    test('with chars and range (v2)', () => {
      const result = CronFieldCollection.compactField([1, 2, 'L', 'W']);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 2, count: 1 },
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);
    });

    test('with chars and range (v3)', () => {
      const result = CronFieldCollection.compactField([1, 2, 3, 'L', 'W']);
      expect(result).toEqual([
        { start: 1, end: 3, count: 3, step: 1 },
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);
    });
  });

  describe('from', () => {
    let base: CronFieldCollection;

    beforeEach(() => {
      base = new CronFieldCollection({
        second: new CronSecond([0]),
        minute: new CronMinute([0]),
        hour: new CronHour([12]),
        dayOfMonth: new CronDayOfMonth([1]),
        month: new CronMonth([1]),
        dayOfWeek: new CronDayOfWeek([1]),
      });
    });

    test('should return same fields when no overrides provided', () => {
      const result = CronFieldCollection.from(base, {});

      expect(result.second).toBe(base.second);
      expect(result.minute).toBe(base.minute);
      expect(result.hour).toBe(base.hour);
      expect(result.dayOfMonth).toBe(base.dayOfMonth);
      expect(result.month).toBe(base.month);
      expect(result.dayOfWeek).toBe(base.dayOfWeek);
    });

    test('should use provided CronField instances', () => {
      const newHour = new CronHour([15]);
      const newMinute = new CronMinute([30]);

      const result = CronFieldCollection.from(base, {
        hour: newHour,
        minute: newMinute,
      });

      expect(result.hour).toBe(newHour);
      expect(result.minute).toBe(newMinute);
      expect(result.second).toBe(base.second);
    });

    test('should create new fields from raw values', () => {
      const result = CronFieldCollection.from(base, {
        hour: [15],
        minute: [30],
      });

      expect(result.hour).not.toBe(base.hour);
      expect(result.hour.values).toEqual([15]);
      expect(result.minute).not.toBe(base.minute);
      expect(result.minute.values).toEqual([30]);
    });

    test('should handle special characters (L)', () => {
      const result = CronFieldCollection.from(base, {
        dayOfMonth: ['L'],
        dayOfWeek: ['L'],
      });
      expect(result.dayOfMonth).not.toBe(base.dayOfMonth);
      expect(result.dayOfMonth.values).toEqual(['L']);
      expect(result.dayOfWeek).not.toBe(base.dayOfWeek);
      expect(result.dayOfWeek.values).toEqual(['L']);
      expect(result.stringify(true)).toEqual('0 0 12 L 1 L');
    });

    test('should handle mix of CronField instances and raw values', () => {
      const newHour = new CronHour([15]);

      const result = CronFieldCollection.from(base, {
        hour: newHour,
        minute: [30],
      });

      expect(result.hour).toBe(newHour);
      expect(result.minute).not.toBe(base.minute);
      expect(result.minute.values).toEqual([30]);
    });

    test('should handle multiple values in raw array', () => {
      const result = CronFieldCollection.from(base, {
        hour: [12, 15, 18],
        minute: [0, 15, 30, 45],
      });

      expect(result.hour).not.toBe(base.hour);
      expect(result.hour.values).toEqual([12, 15, 18]);
      expect(result.minute).not.toBe(base.minute);
      expect(result.minute.values).toEqual([0, 15, 30, 45]);
    });
  });
});
