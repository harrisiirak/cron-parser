import {CronFields} from '../src/';
import {CronField} from '../src';
import {CronDayOfMonth} from '../src';
import {CronDayOfTheWeek} from '../src';
import {CronHour} from '../src';
import {CronMinute} from '../src';
import {CronMonth} from '../src';
import {CronSecond} from '../src';
import {DayOfTheMonthRange, DayOfTheWeekRange, HourRange, MonthRange, SixtyRange} from '../src';

describe('CronFields', () => {
  test('stringify() and debug() methods', () => {
    const expected = {
      second: {
        chars: [],
        max: 59,
        min: 0,
        wildcard: false,
        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
      },
      minute: {
        chars: [],
        max: 59,
        min: 0,
        wildcard: false,
        values: [0, 30],
      },
      hour: {
        chars: [],
        max: 23,
        min: 0,
        wildcard: false,
        values: [9, 11, 13, 15, 17],
      },
      dayOfMonth: {
        chars: ['L'],
        max: 31,
        min: 1,
        wildcard: false,
        values: [1, 15],
      },
      month: {
        chars: [],
        max: 12,
        min: 1,
        wildcard: false,
        values: [1, 3, 5, 7, 9, 11],
      },
      dayOfWeek: {
        chars: ['L'],
        max: 7,
        min: 0,
        wildcard: false,
        values: [1, 2, 3, 4, 5],
      },
    };
    const cronFields = new CronFields({
      second: new CronSecond(<SixtyRange[]>expected.second.values),
      minute: new CronMinute(<SixtyRange[]>expected.minute.values),
      hour: new CronHour(<HourRange[]>expected.hour.values),
      dayOfMonth: new CronDayOfMonth(<DayOfTheMonthRange[]>expected.dayOfMonth.values),
      month: new CronMonth(<MonthRange[]>expected.month.values),
      dayOfWeek: new CronDayOfTheWeek(<DayOfTheWeekRange[]>expected.dayOfWeek.values),
    });

    expect(cronFields.stringify()).toEqual('0,30 9-17/2 1,15 */2 1-5');
    expect(cronFields.stringify(true)).toEqual('* 0,30 9-17/2 1,15 */2 1-5');
    expect(cronFields.serialize()).toEqual(expected);
  });

  test('invalid constructor parameters', () => {
    expect(() => {

      new CronFields({
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
    const cronFields = new CronFields({
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
    const cronFields = new CronFields({
      second: new CronSecond([0]),
      minute: new CronMinute([0, 30]),
      hour: new CronHour([9]),
      dayOfMonth: new CronDayOfMonth([15]),
      month: new CronMonth([1]),
      dayOfWeek: new CronDayOfTheWeek([1, 2, 3, 4, 5]),
    });

    expect(cronFields.dayOfMonth.serialize()).toEqual({
      'chars': ['L'],
      'max': 31,
      'min': 1,
      'values': [15],
      'wildcard': false,
    });
  });

  test('CronField constructor', () => {
    expect(() => {
      new CronField([0], 0, 12, [], false);
    }).toThrow('Cannot construct CronField instances directly');
  });

});
