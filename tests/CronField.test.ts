import {
  CronDayOfMonth,
  CronDayOfTheWeek,
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

// var a = {
//   'second': {
//     'wildcard': false,
//     'values': [
//       0
//     ]
//   },
//   'minute': {
//     'wildcard': false,
//     'values': [
//       0,
//       30
//     ]
//   },
//   'hour': {
//     'wildcard': false,
//     'values': [
//       9
//     ]
//   },
//   'dayOfMonth': {
//     'wildcard': false,
//     'values': [
//       15
//     ]
//   },
//   'month': {
//     'wildcard': false,
//     'values': [
//       1
//     ]
//   },
//   'dayOfWeek': {
//     'wildcard': false,
//     'values': [
//       1,
//       2,
//       3,
//       4,
//       5
//     ]
//   }
// };

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
      dayOfWeek: new CronDayOfTheWeek(<DayOfWeekRange[]>expected.dayOfWeek.values),
    });

    expect(cronFields.stringify()).toEqual('0,30 9-17/2 1,15 */2 1-5');
    expect(cronFields.stringify(true)).toEqual('* 0,30 9-17/2 1,15 */2 1-5');
    expect(cronFields.serialize()).toEqual(expected);
  });

  test('invalid constructor parameters', () => {
    expect(() => {

      new CronFieldCollection({
        second: new CronSecond([0]),
        minute: new CronMinute([0, 30]),
        hour: new CronHour([9]),
        dayOfMonth: new CronDayOfMonth([15]),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        month: '*/2', // Should be an instance of CronMonth
        dayOfWeek: new CronDayOfTheWeek([1, 2, 3, 4, 5]),
      });
    }).toThrow('Validation error, month must be an instance of CronMonth when dayOfMonth is an instance of CronDayOfMonth');
  });

  test('getters', () => {
    const cronFields = new CronFieldCollection({
      second: new CronSecond([0]),
      minute: new CronMinute([0, 30]),
      hour: new CronHour([9]),
      dayOfMonth: new CronDayOfMonth([15]),
      month: new CronMonth([1]),
      dayOfWeek: new CronDayOfTheWeek([1, 2, 3, 4, 5]),
    });

    expect(cronFields.second).toBeInstanceOf(CronSecond);
    expect(cronFields.minute).toBeInstanceOf(CronMinute);
    expect(cronFields.hour).toBeInstanceOf(CronHour);
    expect(cronFields.dayOfMonth).toBeInstanceOf(CronDayOfMonth);
    expect(cronFields.month).toBeInstanceOf(CronMonth);
    expect(cronFields.dayOfWeek).toBeInstanceOf(CronDayOfTheWeek);
  });

  test('serialize', () => {
    const cronFields = new CronFieldCollection({
      second: new CronSecond([0]),
      minute: new CronMinute([0, 30]),
      hour: new CronHour([9]),
      dayOfMonth: new CronDayOfMonth([15]),
      month: new CronMonth([1]),
      dayOfWeek: new CronDayOfTheWeek([1, 2, 3, 4, 5]),
    });

    expect(cronFields.dayOfMonth.serialize()).toEqual({
      'values': [15],
      'wildcard': false,
    });
  });

  describe('CronFieldCollection.compactField', () => {
    test('compact field - empty array', () => {
      const result = CronFieldCollection.compactField([]);
      expect(result).toEqual([]);
    });

    test('compact field - single element array', () => {
      const result = CronFieldCollection.compactField([1]);
      expect(result).toEqual([{ start: 1, count: 1 }]);
    });

    test('compact field - 2 elements array', function () {
      const result = CronFieldCollection.compactField([1, 2]);
      expect(result).toEqual([{ start: 1, count: 1 }, { start: 2, count: 1 }]);
    });

    test('compact field - 2 elements array big step', function () {
      const result = CronFieldCollection.compactField([1, 5]);
      expect(result).toEqual([{ start: 1, count: 1 }, { start: 5, count: 1 }]);
    });


    test('compact field - 3 elements array 1 step', function () {
      const result = CronFieldCollection.compactField([1, 2, 3]);
      expect(result).toEqual([{ start: 1, end: 3, count: 3, step: 1 }]);
    });


    test('compact field - 3 elements array 1 step, dangling extra at end', function () {
      const result = CronFieldCollection.compactField([1, 2, 3, 5]);
      expect(result).toEqual([{ start: 1, end: 3, count: 3, step: 1 }, { start: 5, count: 1 }]);
    });


    test('compact field - 3 elements array 1 step, dangling extra at end and beginning', function () {
      const result = CronFieldCollection.compactField([1, 4, 5, 6, 9]);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 4, end: 6, count: 3, step: 1 },
        { start: 9, count: 1 },
      ]);
    });


    test('compact field - 2 ranges with dangling in the middle', function () {

      const result = CronFieldCollection.compactField([1, 2, 3, 6, 9, 11, 13]);
      expect(result).toEqual([
        { start: 1, end: 3, count: 3, step: 1 },
        { start: 6, count: 1 },
        { start: 9, end: 13, count: 3, step: 2 },
      ]);

    });

    test('compact field - with chars', function () {

      const result = CronFieldCollection.compactField(['L', 'W']);
      expect(result).toEqual([
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);

    });

    test('compact field - with chars and range', function () {

      const result = CronFieldCollection.compactField([1, 'L', 'W']);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);

    });

    test('compact field - with chars and range (v2)', function () {
      const result = CronFieldCollection.compactField([1, 2, 'L', 'W']);
      expect(result).toEqual([
        { start: 1, count: 1 },
        { start: 2, count: 1 },
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);
    });

    test('compact field - with chars and range (v3)', () => {
      const result = CronFieldCollection.compactField([1, 2, 3, 'L', 'W']);
      expect(result).toEqual([
        { start: 1, end: 3, count: 3, step: 1 },
        { start: 'L', count: 1 },
        { start: 'W', count: 1 },
      ]);
    });
  });
});
