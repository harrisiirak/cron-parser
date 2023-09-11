import {
  CronDayOfMonth,
  CronDayOfWeek,
  CronFieldCollection,
  CronHour,
  CronMinute,
  CronMonth,
  CronSecond,
  DayOfMonthRange,
  DayOfWeekRange,
  HourRange,
  MonthRange,
  SixtyRange,
} from '../src';

describe('CronFields', () => {
  // an array of numbers from 0 to 59
  const sixtyRange: number[] = Array.from(Array(60).keys());
  test('stringify() and debug() methods', () => {
    const expected = {
      second: {
        wildcard: false,
        values: sixtyRange,
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

  test('getters', () => {
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

  test('serialize', () => {
    const cronFields = new CronFieldCollection({
      second: new CronSecond([0]),
      minute: new CronMinute([0, 30]),
      hour: new CronHour([9]),
      dayOfMonth: new CronDayOfMonth([15]),
      month: new CronMonth([1]),
      dayOfWeek: new CronDayOfWeek([1, 2, 3, 4, 5]),
    });

    expect(cronFields.dayOfMonth.serialize()).toEqual({
      'values': [15],
      'wildcard': false,
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
      expect(result).toEqual([{ start: 1, count: 1 }, { start: 2, count: 1 }]);
    });

    test('2 elements array big step', () => {
      const result = CronFieldCollection.compactField([1, 5]);
      expect(result).toEqual([{ start: 1, count: 1 }, { start: 5, count: 1 }]);
    });

    test('3 elements array 1 step', () => {
      const result = CronFieldCollection.compactField([1, 2, 3]);
      expect(result).toEqual([{ start: 1, end: 3, count: 3, step: 1 }]);
    });

    test('3 elements array 1 step, dangling extra at end', () => {
      const result = CronFieldCollection.compactField([1, 2, 3, 5]);
      expect(result).toEqual([{ start: 1, end: 3, count: 3, step: 1 }, { start: 5, count: 1 }]);
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
});
