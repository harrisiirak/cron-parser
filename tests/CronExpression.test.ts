import { CronDate, CronExpression, CronFieldCollection, PredefinedExpressions } from '../src/index.js';
import { CronParseOptions } from '../src/types.js';

const typeCheckCronDateObject = (date: CronDate | { value: CronDate; done: boolean }): date is { value: CronDate; done: boolean } => {
  return typeof date === 'object' && 'value' in date && 'done' in date;
};

describe('CronExpression', () => {
  const cronDateTypedTest = (date: unknown, testFn: (date: CronDate) => void): void => {
    if (!(date instanceof CronDate)) {
      throw new Error('date is not instance of CronDate');
    }
    testFn(date);
  };

  test('empty expression test', function () {
    const interval = CronExpression.parse('');
    const date = new CronDate();
    date.addMinute();
    const next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(date.getMinutes())); // 'Schedule matches'
  });

  test('default expression test', function () {
    const interval = CronExpression.parse('* * * * *');
    const date = new CronDate();
    date.addMinute();
    const next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(date.getMinutes())); // 'Schedule matches'
  });

  test('default expression (tab separate) test', function () {
    const interval = CronExpression.parse('*	*	*	*	*');
    const date = new CronDate();
    date.addMinute();
    const next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(date.getMinutes())); // 'Schedule matches'
  });

  test('default expression (multi-space separated) test 1', function () {
    const interval = CronExpression.parse('* \t*\t\t  *\t   *  \t\t*');
    const date = new CronDate();
    date.addMinute();
    const next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(date.getMinutes())); // 'Schedule matches'
  });


  test('default expression (multi-space separated) test 1', function () {
    const interval = CronExpression.parse('* \t    *\t \t  *   *  \t \t  *');
    const date = new CronDate();
    date.addMinute();
    const next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(date.getMinutes())); // 'Schedule matches'
  });

  test('value out of the range', function () {
    expect(() => CronExpression.parse('61 * * * * *')).toThrow('Constraint error, got value 61 expected range 0-59');
  });

  test('second value out of the range', function () {
    // expect(() => CronExpression.parse('-1 * * * * *')).toThrow('Constraint error, got value -1 expected range 0-59');
    expect(() => CronExpression.parse('-1 * * * * *')).toThrow('Constraint error, got range NaN-1 expected range 0-59');
  });

  test('invalid range', function () {
    // expect(() => CronExpression.parse('- * * * * *')).toThrow('Invalid range: -');
    expect(() => CronExpression.parse('- * * * * *')).toThrow('Constraint error, got range NaN-NaN expected range 0-59');
  });

  test('minute value out of the range', function () {
    expect(() => CronExpression.parse('* 32,72 * * * *')).toThrow('Constraint error, got value 72 expected range 0-59');
  });

  test('hour value out of the range', function () {
    expect(() => CronExpression.parse('* * 12-36 * * *')).toThrow('Constraint error, got range 12-36 expected range 0-23');
  });


  test('day of the month value out of the range', function () {
    expect(() => CronExpression.parse('* * * 10-15,40 * *')).toThrow('Constraint error, got value 40 expected range 1-31');
  });

  test('month value out of the range', function () {
    expect(() => CronExpression.parse('* * * * */10,12-13 *')).toThrow('Constraint error, got range 12-13 expected range 1-12');
  });

  test('day of the week value out of the range', function () {
    expect(() => CronExpression.parse('* * * * * 9')).toThrow('Constraint error, got value 9 expected range 0-7');
  });

  test('invalid expression that contains too many fields', function () {
    expect(() => CronExpression.parse('* * * * * * * *ASD')).toThrow('Invalid cron expression');
  });

  test('invalid explicit day of month definition', function () {
    expect(() => {
      const iter = CronExpression.parse('0 0 31 4 *');
      iter.next();
    }).toThrow('Invalid explicit day of month definition');
  });

  test('incremental minutes expression test', function () {
    const interval = CronExpression.parse('*/3 * * * *');
    const next = interval.next();
    // expect(next.getMinutes() % 3).toEqual(0); // 'Schedule matches'
    cronDateTypedTest(next, (date) => expect(date.getMinutes() % 3).toEqual(0)); // 'Schedule matches'
  });

  test('fixed expression test', function () {
    const interval = CronExpression.parse('10 2 12 8 0');
    const next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of Month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
      expect(date.getHours()).toEqual(2); // 'Hour matches'
      expect(date.getMinutes()).toEqual(10); // 'Minute matches'
    });
  });

  test('invalid characters test - symbol', function () {
    expect(() => CronExpression.parse('10 ! 12 8 0')).toThrow('Invalid characters, got value: !');
  });

  test('invalid characters test - letter', function () {
    expect(() => CronExpression.parse('10 x 12 8 0')).toThrow('Invalid characters, got value: x');
  });

  test('invalid characters test - parentheses', function () {
    expect(() => CronExpression.parse('10 ) 12 8 0')).toThrow('Invalid characters, got value: )');
  });

  test('interval with invalid characters test', function () {
    expect(() => CronExpression.parse('10 */A 12 8 0')).toThrow('Invalid characters, got value: */A');

  });

  test('range with invalid characters test', function () {
    expect(() => CronExpression.parse('10 0-z 12 8 0')).toThrow('Invalid characters, got value: 0-z');
  });

  test('group with invalid characters test', function () {
    expect(() => CronExpression.parse('10 0,1,z 12 8 0')).toThrow('Invalid characters, got value: 0,1,z');
  });

  test('invalid expression which has repeat 0 times', function () {
    expect(() => CronExpression.parse('0 */0 * * *')).toThrow('Constraint error, cannot repeat at every 0 time.');
  });

  test('invalid expression which has repeat negative number times', function () {
    expect(() => CronExpression.parse('0 */-5 * * *')).toThrow('Constraint error, cannot repeat at every -5 time.');
  });

  test('invalid expression which has multiple combined repeat cycles', function () {
    expect(() => CronExpression.parse('0 5/5/5 * * *')).toThrow('Invalid repeat: 5/5/5');
  });

  test('range test with value and repeat (second)', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('0/30 * * * * ?', options);

    let next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getSeconds()).toEqual(0));

    next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getSeconds()).toEqual(30));

    next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getSeconds()).toEqual(0));

  });

  test('range test with value and repeat (minute)', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('6/23 * * * *', options);

    let next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(52));

    next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(6));

    next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(29));

    next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getMinutes()).toEqual(52));
  });

  test('range test with iterator', function () {
    const interval = CronExpression.parse('10-30 2 12 8 0');

    const intervals = interval.iterate(20);

    for (let i = 0, c = intervals.length; i < c; i++) {
      const next = intervals[i];
      cronDateTypedTest(next, (date) => {
        expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
        expect(date.getMonth()).toEqual(7); // 'Month matches'
        expect(date.getHours()).toEqual(2); // 'Hour matches'
        expect(date.getMinutes()).toEqual(10 + i); // 'Minute matches'
      });
    }
  });

  test('incremental range test with iterator', function () {
    const interval = CronExpression.parse('10-30/2 2 12 8 0');
    const intervals = interval.iterate(10);

    for (let i = 0, c = intervals.length; i < c; i++) {
      const next = intervals[i];
      expect(next).toBeTruthy();
      cronDateTypedTest(next, (date) => {
        expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
        expect(date.getMonth()).toEqual(7); // 'Month matches'
        expect(date.getHours()).toEqual(2); // 'Hour matches'
        expect(date.getMinutes()).toEqual(10 + (i * 2)); // 'Minute matches'
      });
    }
  });

  test('range with the same start and end value', function () {
    const interval = CronExpression.parse('*/10 2-2 * * *');
    expect(interval).toBeTruthy();
  });

  test('predefined expression', function () {
    const interval = CronExpression.parse('@yearly');
    const date = new CronDate();
    date.addYear();
    const next = interval.next();
    cronDateTypedTest(next, (date) => expect(date.getFullYear()).toEqual(date.getFullYear())); // 'Year matches'
  });

  test('expression limited with start and end date', function () {
    const options = <CronParseOptions>{
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      startDate: new CronDate('Wed, 26 Dec 2012 12:40:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 16:40:00'),
    };

    const interval = CronExpression.parse('*/20 * * * *', options);

    const dates1 = interval.iterate(10);
    expect(dates1.length).toEqual(7); // 'Dates count matches for positive iteration'

    interval.reset();

    const dates2 = interval.iterate(-10);
    expect(dates2.length).toEqual(6); // 'Dates count matches for negative iteration'

    interval.reset();

    // Forward iteration
    let next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(14); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(15); // 'Hour matches'
      expect(date.getMinutes()).toEqual(0); // 'Minute matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(15); // 'Hour matches'
      expect(date.getMinutes()).toEqual(20); // 'Minute matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(15); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(16); // 'Hour matches'
      expect(date.getMinutes()).toEqual(0); // 'Minute matches'
    });
    next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(16); // 'Hour matches'
      expect(date.getMinutes()).toEqual(20); // 'Minute matches'
    });
    next = interval.next();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(16); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });
    expect(() => interval.next()).toThrow(); // 'Should fail'

    next = interval.prev();
    cronDateTypedTest(next, (date) => {
      expect(date.getHours()).toEqual(16); // 'Hour matches'
      expect(date.getMinutes()).toEqual(20); // 'Minute matches'
    });

    interval.reset();

    // Backward iteration
    let prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(14); // 'Hour matches'
      expect(date.getMinutes()).toEqual(20); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(14); // 'Hour matches'
      expect(date.getMinutes()).toEqual(0); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(13); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(13); // 'Hour matches'
      expect(date.getMinutes()).toEqual(20); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(13); // 'Hour matches'
      expect(date.getMinutes()).toEqual(0); // 'Minute matches'
    });
    expect(interval.hasPrev()).toBe(true);
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(12); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });
    expect(interval.hasPrev()).toBe(false);
    expect(() => interval.prev()).toThrow(); // 'Should fail'
  });

  test('expression limited with start and end date with prev', function () {
    const options = <CronParseOptions>{
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      startDate: new CronDate('Wed, 26 Dec 2012 12:40:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 16:40:00'),
    };

    const interval = CronExpression.parse('*/20 * * * *', options);

    // Backward iteration
    let prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(14); // 'Hour matches'
      expect(date.getMinutes()).toEqual(20); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(14); // 'Hour matches'
      expect(date.getMinutes()).toEqual(0); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(13); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(13); // 'Hour matches'
      expect(date.getMinutes()).toEqual(20); // 'Minute matches'
    });
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(13); // 'Hour matches'
      expect(date.getMinutes()).toEqual(0); // 'Minute matches'
    });
    expect(interval.hasPrev()).toBe(true);
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(12); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });
    expect(interval.hasPrev()).toBe(false);
    expect(() => interval.prev()).toThrow(); // 'Should fail'
  });

  test('iterate', function () {
    const options = <CronParseOptions>{
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      startDate: new CronDate('Wed, 26 Dec 2012 12:40:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 16:40:00'),
      tz: 'UTC',
    };

    const interval = CronExpression.parse('*/20 * * * *', options);
    const expected1 = [
      '2012-12-26T19:40:00.000Z',
      '2012-12-26T20:00:00.000Z',
      '2012-12-26T20:20:00.000Z',
      '2012-12-26T20:40:00.000Z',
      '2012-12-26T21:00:00.000Z',
    ];

    interval.iterate(5, (date) => {
      cronDateTypedTest(date, (date) => {
        expect(date.toISOString()).toEqual(expected1.shift());
      });
    });
  });

  test('predefined expression should be valid', () => {
    expect(PredefinedExpressions).toEqual({
      '@daily': '0 0 0 * * *',
      '@hourly': '0 0 * * * *',
      '@minutely': '0 * * * * *',
      '@monthly': '0 0 0 1 * *',
      '@secondly': '* * * * * *',
      '@weekdays': '0 0 0 * * 1-5',
      '@weekends': '0 0 0 * * 0,6',
      '@weekly': '0 0 0 * * 0',
      '@yearly': '0 0 0 1 1 *',
      '@annually': '0 0 0 1 1 *',
    });
  });

  test('reset to given date', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };

    const interval = CronExpression.parse('*/20 * * * *', options);

    // Forward iteration
    let next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(14); // 'Hour matches'
      expect(next.getMinutes()).toEqual(40); // 'Minute matches'
    });

    interval.reset(); // defaults to initial currentDate

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(14); // 'Hour matches'
      expect(next.getMinutes()).toEqual(40); // 'Minute matches'
    });

    interval.reset(new CronDate('Wed, 26 Dec 2012 17:23:53'));

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(17); // 'Hour matches'
      expect(next.getMinutes()).toEqual(40); // 'Minute matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(18); // 'Hour matches'
      expect(next.getMinutes()).toEqual(0); // 'Minute matches'
    });

    interval.reset(new Date('2019-06-18T08:18:36.000'));

    next = interval.prev();
    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(18); // 'Date matches'
      expect(next.getHours()).toEqual(8); // 'Hour matches'
      expect(next.getMinutes()).toEqual(0); // 'Minute matches'
    });

    next = interval.prev();
    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(18); // 'Date matches'
      expect(next.getHours()).toEqual(7); // 'Hour matches'
      expect(next.getMinutes()).toEqual(40); // 'Minute matches'
    });
  });

  test('parse expression as UTC', function () {
    const options = {
      utc: true,
    };

    let interval = CronExpression.parse('0 0 10 * * *', options);
    const date1 = interval.next();
    cronDateTypedTest(date1, (date) => {
      expect(date.getUTCHours()).toEqual(10); // 'Correct UTC hour value'
      expect(date.getHours()).toEqual(10); // 'Correct UTC hour value'
    });

    interval = CronExpression.parse('0 */5 * * * *', options);

    const date2 = interval.next(), now = new Date();
    now.setMinutes(now.getMinutes() + 5 - (now.getMinutes() % 5));

    cronDateTypedTest(date2, (date) => {
      expect(date.getHours()).toEqual(now.getUTCHours()); // 'Correct local time for 5 minute interval'
    });
  });

  test('expression using days of week strings', function () {
    const interval = CronExpression.parse('15 10 * * MON-TUE');
    const intervals = interval.iterate(8);
    expect(intervals).toBeTruthy();

    for (let i = 0, c = intervals.length; i < c; i++) {
      const next = intervals[i];
      if (!(next instanceof CronDate)) {
        throw new Error('Expected CronDate instance');
      }
      const day = next.getDay();
      expect(next).toBeTruthy(); // 'Found next scheduled interval'
      expect(day === 1 || day === 2).toBeTruthy(); // 'Day matches'
      cronDateTypedTest(next, (next) => {
        expect(next.getHours()).toEqual(10); // 'Hour matches'
        expect(next.getMinutes()).toEqual(15); // 'Minute matches'
      });
    }
  });

  test('expression using days of week strings - wrong alias', function () {
    expect(() => CronExpression.parse('15 10 * * MON-TUR')).toThrow('Validation error, cannot resolve alias "tur"');
  });

  test('expression using mixed days of week strings', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };

    const interval = CronExpression.parse('15 10 * jAn-FeB mOn-tUE', options);

    const intervals = interval.iterate(8);
    expect(intervals).toBeTruthy();

    for (let i = 0, c = intervals.length; i < c; i++) {
      const next = intervals[i];
      if (!(next instanceof CronDate)) {
        throw new Error('Expected CronDate instance');
      }
      const day = next.getDay();
      const month = next.getMonth();

      expect(next).toBeTruthy(); // 'Found next scheduled interval'
      expect(month === 0 || month === 1).toBeTruthy(); // 'Month Matches'
      expect(day === 1 || day === 2).toBeTruthy(); // 'Day matches'
      cronDateTypedTest(next, (next) => {
        expect(next.getHours()).toEqual(10); // 'Hour matches'
        expect(next.getMinutes()).toEqual(15); // 'Minute matches'
      });
    }
  });

  test('expression using non-standard second field (wildcard)', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
    };

    const interval = CronExpression.parse('* * * * * *', options);

    const intervals = interval.iterate(10);
    expect(intervals).toBeTruthy();

    for (let i = 0, c = intervals.length; i < c; i++) {
      const next = intervals[i];
      // t.ok(next, 'Found next scheduled interval');
      expect(next).toBeTruthy();
      cronDateTypedTest(next, (next) => {
        expect(next.getSeconds()).toEqual(i + 1); // 'Second matches'
      });
    }
  });

  test('expression using non-standard second field (step)', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
    };

    const interval = CronExpression.parse('*/20 * * * * *', options);

    const intervals = interval.iterate(3);
    expect(intervals).toBeTruthy();

    cronDateTypedTest(intervals[0], (date) => {
      expect(date.getSeconds()).toEqual(20); // 'first matches'
    });
    cronDateTypedTest(intervals[1], (date) => {
      expect(date.getSeconds()).toEqual(40); // 'Second matches'
    });
    cronDateTypedTest(intervals[2], (date) => {
      expect(date.getSeconds()).toEqual(0); // 'third matches'
    });
  });

  test('expression using non-standard second field (range)', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
    };

    const interval = CronExpression.parse('20-40/10 * * * * *', options);

    const intervals = interval.iterate(3);
    expect(intervals).toBeTruthy();

    for (let i = 0, c = intervals.length; i < c; i++) {
      const next = intervals[i];
      expect(next).toBeTruthy();
      cronDateTypedTest(next, (next) => {
        expect(next.getSeconds()).toEqual(20 + (i * 10)); // 'Second matches'
      });
    }
  });

  test('expression using explicit month definition and */5 day of month step', function () {
    const firstIterator = CronExpression.parse('0 12 */5 6 *', {
      currentDate: '2019-06-01T11:00:00.000',
    });

    const firstExpectedDates = [
      new CronDate('2019-06-01T12:00:00.000'),
      new CronDate('2019-06-06T12:00:00.000'),
      new CronDate('2019-06-11T12:00:00.000'),
      new CronDate('2019-06-16T12:00:00.000'),
      new CronDate('2019-06-21T12:00:00.000'),
      new CronDate('2019-06-26T12:00:00.000'),
      new CronDate('2020-06-01T12:00:00.000'),
    ];

    firstExpectedDates.forEach(function (expectedDate) {
      cronDateTypedTest(firstIterator.next(), (date) => {
        expect(expectedDate.toISOString()).toEqual(date.toISOString());
      });
    });

    const secondIterator = CronExpression.parse('0 15 */5 5 *', {
      currentDate: '2019-05-01T11:00:00.000',
    });

    const secondExpectedDates = [
      new CronDate('2019-05-01T15:00:00.000'),
      new CronDate('2019-05-06T15:00:00.000'),
      new CronDate('2019-05-11T15:00:00.000'),
      new CronDate('2019-05-16T15:00:00.000'),
      new CronDate('2019-05-21T15:00:00.000'),
      new CronDate('2019-05-26T15:00:00.000'),
      new CronDate('2019-05-31T15:00:00.000'),
      new CronDate('2020-05-01T15:00:00.000'),
    ];

    secondExpectedDates.forEach(function (expectedDate) {
      cronDateTypedTest(secondIterator.next(), (date) => {
        expect(expectedDate.toISOString()).toEqual(date.toISOString());
      });
    });

  });

  test('day of month and week are both set', function () {
    const interval = CronExpression.parse('10 2 12 8 0');
    let next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });
  });

  test('day of month is unspecified', function () {
    // At 02:10:00am, on every Wednesday, every month
    const expected = [
      '2023-05-03T02:10:00.000Z',
      '2023-05-10T02:10:00.000Z',
      '2023-05-17T02:10:00.000Z',
      '2023-05-24T02:10:00.000Z',
      '2023-05-31T02:10:00.000Z',
      '2023-06-07T02:10:00.000Z',
      '2023-06-14T02:10:00.000Z',
      '2023-06-21T02:10:00.000Z',
      '2023-06-28T02:10:00.000Z',
      '2023-07-05T02:10:00.000Z',
    ];

    const options = {
      currentDate: '2023-04-29T00:00:00.000',
      tz: 'UTC',
    };
    const interval = CronExpression.parse('10 2 ? * 3', options);

    expected.forEach((expectedDate) => {
      cronDateTypedTest(interval.next(), (date) => {
        expect(date.toISOString()).toEqual(expectedDate);
      });
    });

  });

  test('day of week is unspecified', function () {
    const interval = CronExpression.parse('10 2 3,6 * ?');
    let next = interval.next();

    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect(date.getDate() === 3 || date.getDate() === 6).toBeTruthy()); // 'date matches'

    if (!(next instanceof CronDate)) {
      throw new Error('next is not a CronDate');
    }

    let prevDate = next.getDate();
    next = interval.next();

    expect(next).toBeTruthy();
    // 'date matches and is not previous date'
    cronDateTypedTest(next, (date) => expect((date.getDate() === 3 || date.getDate() === 6) && date.getDate() !== prevDate).toBeTruthy());

    if (!(next instanceof CronDate)) {
      throw new Error('next is not a CronDate');
    }

    prevDate = next.getDate();

    next = interval.next();
    expect(next).toBeTruthy();
    // 'date matches and is not previous date'
    cronDateTypedTest(next, (date) => expect((date.getDate() === 3 || date.getDate() === 6) && date.getDate() !== prevDate).toBeTruthy());

    if (!(next instanceof CronDate)) {
      throw new Error('next is not a CronDate');
    }

    prevDate = next.getDate();

    next = interval.next();
    expect(next).toBeTruthy();
    // 'date matches and is not previous date'
    cronDateTypedTest(next, (date) => expect((date.getDate() === 3 || date.getDate() === 6) && date.getDate() !== prevDate).toBeTruthy());
  });

  test('Summertime bug test', function () {
    const month = new CronDate().getMonth() + 1;
    const interval = CronExpression.parse('0 0 0 1 ' + month + ' *');

    const next = interval.next();
    expect(next).toBeTruthy();
    // TODO - should this test do something more than just check that next is truthy?
    // Before fix the bug it was getting a timeout error if you are
    // in a timezone that changes the DST to ST in the hour 00:00h.
  });


  test('day of month and week are both set and dow is 7', function () {
    const interval = CronExpression.parse('10 2 12 8 7');
    let next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (date) => {
      expect(date.getDay() === 0 || date.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(date.getMonth()).toEqual(7); // 'Month matches'
    });
  });

  test('day of month is wildcard, month and day of week are both set', function () {
    const options = {
      currentDate: new CronDate('Mon, 31 May 2021 12:00:00'),
    };
    const interval = CronExpression.parse('0 0 * 6 2', options);
    const expectedDayMatches = [1, 8, 15, 22, 29];

    expectedDayMatches.forEach(function (dayOfMonth) {
      const next = interval.next();
      expect(next).toBeTruthy();
      cronDateTypedTest(next, (next) => {
        expect(next.getDay()).toEqual(2); // 'Day of week matches'
        expect(next.getDate()).toEqual(dayOfMonth); // 'Day of month matches'
        expect(next.getMonth()).toEqual(5); // 'Month matches'
      });
    });
  });

  test('day of month contains multiple ranges and day of week is wildcard', function () {
    const options = {
      currentDate: new CronDate('Sat, 1 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('0 0 0 2-4,7-31 * *', options);
    let next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(2); // 'Day of month matches'
      expect(next.getMonth()).toEqual(11); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(3); // 'Day of month matches'
      expect(next.getMonth()).toEqual(11); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(4); // 'Day of month matches'
      expect(next.getMonth()).toEqual(11); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(7); // 'Day of month matches'
      expect(next.getMonth()).toEqual(11); // 'Month matches'
    });

    next = interval.next();

    // t.ok(next.getDate() === 8, 'Day of month matches');
    // expect(next.getMonth()).toEqual(11); // 'Month matches'
    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(8); // 'Day of month matches'
      expect(next.getMonth()).toEqual(11); // 'Month matches'
    });

    expect(() => interval.next()).not.toThrow();
  });

  test('day of month and week are both set and dow is 6,0', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('10 2 12 8 6,0', options);
    let next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 6 || next.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 6 || next.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); // 'Day or day of month matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });
  });

  test('day of month and week are both set and dow is 6-7', function () {
    // if both "day of month" (field 3) and "day of week" (field 5) are restricted (not contain "*"), then one or both must match the current day.
    // At 02:10 AM, on day 12 of the month, Saturday through Sunday, only in August

    const expected = [
      '2013-08-03T02:10:00.000Z', // - Saturday
      '2013-08-04T02:10:00.000Z', // - Sunday
      '2013-08-10T02:10:00.000Z', // - Saturday
      '2013-08-11T02:10:00.000Z', // - Sunday
      '2013-08-12T02:10:00.000Z', // - Monday - 12th of month
      '2013-08-17T02:10:00.000Z', // - Saturday
      '2013-08-18T02:10:00.000Z', // - Sunday
      '2013-08-24T02:10:00.000Z', // - Saturday
      '2013-08-25T02:10:00.000Z', // - Sunday
      '2013-08-31T02:10:00.000Z', // - Saturday
      '2014-08-02T02:10:00.000Z', // - Saturday
      '2014-08-03T02:10:00.000Z', // - Sunday
      '2014-08-09T02:10:00.000Z', // - Saturday
      '2014-08-10T02:10:00.000Z', // - Sunday
      '2014-08-12T02:10:00.000Z', // - Tuesday - 12th of month
    ];

    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      tz: 'UTC',
    };
    const interval = CronExpression.parse('10 2 12 8 6-7', options);

    let next = interval.next();
    expected.forEach((expectedDate, i) => {
      cronDateTypedTest(next, (next) => {
        expect(`${i}:${next.toISOString()}`).toEqual(`${i}:${expectedDate}`);
      });
      next = interval.next();
    });

    // cronDateTypedTest(next, (next) => {
    //   console.log(next.toISOString());
    //   expect(next.getDay() === 6).toBeTruthy(); // 'Day of week matches'
    //   expect(next.getMonth()).toEqual(7); // 'Month matches'
    // });
    //
    // next = interval.next();
    // cronDateTypedTest(next, (next) => {
    //   expect(next.getDay() === 0).toBeTruthy(); // 'Day of week matches'
    //   expect(next.getMonth()).toEqual(7); // 'Month matches'
    // });
    //
    // next = interval.next();
    // cronDateTypedTest(next, (next) => {
    //   expect(next.getDay() === 6).toBeTruthy(); // 'Day of week matches'
    //   expect(next.getMonth()).toEqual(7); // 'Month matches'
    // });
    //
    // next = interval.next();
    // cronDateTypedTest(next, (next) => {
    //   expect(next.getDay() === 0).toBeTruthy(); // 'Day of week matches'
    //   expect(next.getMonth()).toEqual(7); // 'Month matches'
    // });
    //
    // next = interval.next();
    // cronDateTypedTest(next, (next) => {
    //   expect(next.getDate()).toEqual(12); // 'Day of month matches'
    //   expect(next.getDay() === 1).toBeTruthy(); // 'Day of week matches'
    //   expect(next.getMonth()).toEqual(7); // 'Month matches'
    // });
    //
    // next = interval.next();
    // cronDateTypedTest(next, (next) => {
    //   expect(next.getDay() === 6).toBeTruthy(); // 'Day of week matches'
    //   expect(next.getMonth()).toEqual(7); // 'Month matches'
    // });
  });

  test('day of month validation should be ignored when day of month is wildcard and month is set', function () {
    const options = {
      currentDate: new CronDate('2020-05-01T15:00:00.000'),
    };
    const interval = CronExpression.parse('* * * * 2 *', options);

    const next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(0); // 'Hours matches'
      expect(next.getDate()).toEqual(1); // 'Day of month matches'
      expect(next.getMonth() + 1).toEqual(2); // 'Month matches'
    });

  });

  test('day and date in week should match', function () {
    const interval = CronExpression.parse('0 1 1 1 * 1');

    let next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(1); // 'Hours matches'
      expect(next.getDay() === 1 || next.getDate() === 1).toBeTruthy(); // 'Day or day of month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(1); // 'Hours matches'
      expect(next.getDay() === 1 || next.getDate() === 1).toBeTruthy(); // 'Day or day of month matches'
    });

    next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(1); // 'Hours matches'
      expect(next.getDay() === 1 || next.getDate() === 1).toBeTruthy(); // 'Day or day of month matches'
    });
  });

  test('should sort ranges and values in ascending order', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('0 12,13,10,1-3 * * *', options);
    const hours = [1, 2, 3, 10, 12, 13];

    for (const i in hours) {
      const next = interval.next();
      cronDateTypedTest(next, (next) => {
        expect(next.getHours()).toEqual(hours[i]); // 'Hours matches'
      });
    }
  });

  test('valid ES6 iterator should be returned if iterator options is set to true', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
      iterator: true,
    };

    let val: CronDate | { value: CronDate; done: boolean };
    const interval = CronExpression.parse('*/25 * * * *', options);

    val = interval.next();
    if (!typeCheckCronDateObject(val)) {
      throw new Error('Expected CronDate object or iterator result');
    }
    expect(val?.value).toBeTruthy();
    expect(val.done).toBeFalsy();

    val = interval.next();
    if (!typeCheckCronDateObject(val)) {
      throw new Error('Expected CronDate object or iterator result');
    }
    expect(val?.value).toBeTruthy();
    expect(val.done).toBeFalsy();

    val = interval.next();
    if (!typeCheckCronDateObject(val)) {
      throw new Error('Expected CronDate object or iterator result');
    }
    expect(val?.value).toBeTruthy();
    expect(val.done).toBeTruthy();
  });

  test('dow 6,7 6,0 0,6 7,6 should be equivalent', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };

    const expressions = [
      '30 16 * * 6,7',
      '30 16 * * 6,0',
      '30 16 * * 0,6',
      '30 16 * * 7,6',
    ];

    expressions.forEach(function (expression) {
      const interval = CronExpression.parse(expression, options);
      let val = interval.next();
      cronDateTypedTest(val, (val) => {
        expect(val.getDay() === 6).toBeTruthy(); // 'Day matches'
      });

      val = interval.next();
      cronDateTypedTest(val, (val) => {
        expect(val.getDay() === 0).toBeTruthy(); // 'Day matches'
      });

      val = interval.next();
      cronDateTypedTest(val, (val) => {
        expect(val.getDay() === 6).toBeTruthy(); // 'Day matches'
      });
    });
  });

  test('hour 0 9,11,1 * * * and 0 1,9,11 * * * should be equivalent', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 00:00:00'),
    };

    const expressions = [
      '0 9,11,1 * * *',
      '0 1,9,11 * * *',
    ];

    expressions.forEach(function (expression) {
      const interval = CronExpression.parse(expression, options);

      let val = interval.next();
      cronDateTypedTest(val, (val) => expect(val.getHours()).toEqual(1)); // 'Hour matches'

      val = interval.next();
      cronDateTypedTest(val, (val) => expect(val.getHours()).toEqual(9)); // 'Hour matches'

      val = interval.next();
      cronDateTypedTest(val, (val) => expect(val.getHours()).toEqual(11)); // 'Hour matches'

      val = interval.next();
      cronDateTypedTest(val, (val) => expect(val.getHours()).toEqual(1)); // 'Hour matches'

      val = interval.next();
      cronDateTypedTest(val, (val) => expect(val.getHours()).toEqual(9)); // 'Hour matches'

      val = interval.next();
      cronDateTypedTest(val, (val) => expect(val.getHours()).toEqual(11)); // 'Hour matches'
    });
  });

  test('it will work with #139 issue case', function () {
    const options = {
      currentDate: new Date('2018-11-15T16:15:33.522Z'),
      tz: 'Europe/Madrid',
    };

    const interval = CronExpression.parse('0 0 0 1,2 * *', options);
    const date = interval.next();

    cronDateTypedTest(date, (date) => {
      expect(date.getFullYear()).toEqual(2018);
      expect(date.getDate()).toEqual(1);
      expect(date.getMonth()).toEqual(11);
    });
  });

  test('should work for valid first/second/third/fourth/fifth occurrence dayOfWeek (# char)', function () {
    const options = {
      currentDate: new CronDate('2019-04-30'),
    };

    const expectedFirstDates = [
      new CronDate('2019-05-05'),
      new CronDate('2019-06-02'),
      new CronDate('2019-07-07'),
      new CronDate('2019-08-04'),
    ];
    const expectedSecondDates = [
      new CronDate('2019-05-12'),
      new CronDate('2019-06-09'),
      new CronDate('2019-07-14'),
      new CronDate('2019-08-11'),
    ];
    const expectedThirdDates = [
      new CronDate('2019-05-19'),
      new CronDate('2019-06-16'),
      new CronDate('2019-07-21'),
      new CronDate('2019-08-18'),
    ];
    const expectedFourthDates = [
      new CronDate('2019-05-26'),
      new CronDate('2019-06-23'),
      new CronDate('2019-07-28'),
      new CronDate('2019-08-25'),
    ];
    const expectedFifthDates = [
      new CronDate('2019-06-30'),
      new CronDate('2019-09-29'),
      new CronDate('2019-12-29'),
      new CronDate('2020-03-29'),
    ];

    const allExpectedDates = [
      expectedFirstDates,
      expectedSecondDates,
      expectedThirdDates,
      expectedFourthDates,
      expectedFifthDates,
    ];
    const expressions = [
      '0 0 0 ? * 0#1',
      '0 0 0 ? * 0#2',
      '0 0 0 ? * 0#3',
      '0 0 0 ? * 0#4',
      '0 0 0 ? * 0#5',
    ];
    expressions.forEach(function (expression, index) {
      const interval = CronExpression.parse(expression, options);
      const expectedDates = allExpectedDates[index];

      expectedDates.forEach(function (expected) {
        const date = interval.next();
        cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
      });

      expectedDates
        .slice(0, expectedDates.length - 1)
        .reverse()
        .forEach(function (expected) {
          const date = interval.prev();
          cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
        });
    });
  });

  test('should work for valid second sunday in May', function () {
    const options = {
      currentDate: new CronDate('2023-05-06T00:00:00.000Z'),
      tz: 'UTC',
    };
    const expectedDates = [
      new CronDate('2023-05-14T00:00:00.000Z'),
      new CronDate('2024-05-12T00:00:00.000Z'),
      new CronDate('2025-05-11T00:00:00.000Z'),
      new CronDate('2026-05-10T00:00:00.000Z'),
      new CronDate('2027-05-09T00:00:00.000Z'),
      new CronDate('2028-05-14T00:00:00.000Z'),
    ];

    const interval = CronExpression.parse('0 0 0 ? MAY 0#2', options);
    expectedDates.forEach(function (expected) {
      const date = interval.next();
      cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
    });
    expectedDates
      .slice(0, expectedDates.length - 1)
      .reverse()
      .forEach(function (expected) {
        const date = interval.prev();
        cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
      });
  });

  test('should work for valid second sunday at noon in May', function () {
    const options = {
      currentDate: new CronDate('2019-05-12T11:59:00.000'),
    };
    const expected = new CronDate('2019-05-12T12:00:00.000');

    const interval = CronExpression.parse('0 0 12 ? MAY 0#2', options);
    const date = interval.next();
    cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
  });

  test('should work for valid second sunday at noon in May (UTC+3)', function () {
    const options = {
      currentDate: new CronDate('2019-05-12T11:59:00.000', 'Europe/Sofia'),
    };
    const expected = new CronDate('2019-05-12T12:00:00.000', 'Europe/Sofia');

    const interval = CronExpression.parse('0 0 12 ? MAY 0#2', options);
    const date = interval.next();
    cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
  });

  test('should work with both dayOfMonth and nth occurrence of dayOfWeek', function () {
    const options = {
      currentDate: new CronDate('2019-04-01'),
    };

    const expectedDates = [
      new CronDate('2019-04-16'),
      new CronDate('2019-04-17'),
      new CronDate('2019-04-18'),
      new CronDate('2019-05-15'),
      new CronDate('2019-05-16'),
      new CronDate('2019-05-18'),
    ];

    const interval = CronExpression.parse('0 0 0 16,18 * 3#3', options);

    expectedDates.forEach(function (expected) {
      const date = interval.next();
      cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
    });
    expectedDates
      .slice(0, expectedDates.length - 1)
      .reverse()
      .forEach(function (expected) {
        const date = interval.prev();
        cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
      });
  });

  test('should error when passed invalid occurrence value', function () {
    const expressions = [
      '0 0 0 ? * 1#',
      '0 0 0 ? * 1#0',
      '0 0 0 ? * 4#6',
      '0 0 0 ? * 0##4',
    ];
    expressions.forEach(function (expression) {
      expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek occurrence number (#)');
    });

  });

  // The Quartz documentation says that if the # character is used then no other expression can be used in the dayOfWeek term:
  // http://www.quartz-scheduler.org/api/2.3.0/index.html
  test('cannot combine `-` range and # occurrence special characters', function () {
    const expression = '0 0 0 ? * 2-4#2';
    expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek `#` and `-` special characters are incompatible');
  });

  test('cannot combine `/` repeat interval and # occurrence special characters', function () {
    const expression = '0 0 0 ? * 1/2#3';
    expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek `#` and `/` special characters are incompatible');
  });

  test('cannot combine `,` list and # occurrence special characters', function () {
    const expression = '0 0 0 ? * 0,6#4';
    expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek `#` and `,` special characters are incompatible');

  });

  it('should correctly determine if a given expression includes a Date (#153 and #299)', () => {
    const expression = '* * 1-6 ? * *'; // 1am to 6am every day
    const goodDate = new CronDate('2019-01-01T00:00:00.000');
    const badDate = new CronDate('2019-01-01T07:00:00.000');
    const interval = CronExpression.parse(expression);
    expect(interval.includesDate(goodDate)).toBe(false);
    expect(interval.includesDate(badDate)).toBe(false);
    // TODO - add more tests cases
  });

  it('should correctly determine if a given expression includes a CronDate (#153 and #299)', () => {
    const expression = '* * 1-6 ? * *'; // 1am to 6am every day
    const goodDate = new CronDate('2019-01-01T01:00:00.000');
    const badDate = new CronDate('2019-01-01T07:00:00.000');
    const interval = CronExpression.parse(expression);
    expect(interval.includesDate(goodDate)).toBe(true);
    expect(interval.includesDate(badDate)).toBe(false);
    // TODO - add more tests cases
  });

  it('should correctly handle */2 * * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '*/2 * * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 2; i < 120; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getSeconds()).toEqual(i % 60));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 1/2 * * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '1/2 * * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 1; i < 120; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getSeconds()).toEqual(i % 60));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 1-59/2 * * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '1-59/2 * * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 1; i < 120; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getSeconds()).toEqual(i % 60));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 0 */2 * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '0 */2 * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 2; i < 120; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getMinutes()).toEqual(i % 60));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 0 0/2 * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '0 0/2 * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 2; i < 120; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getMinutes()).toEqual(i % 60));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 0 1/2 * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '0 1/2 * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 1; i < 121; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getMinutes()).toEqual(i % 60));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 0 1-59/2 * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '0 1-59/2 * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 1; i < 121; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getMinutes()).toEqual(i % 60));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 0 1-40/2 * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '0 1-40/2 * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 1; i < 121; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getMinutes()).toEqual(i % 40));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 10/2 * * ? * * (#156)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 01:00:00'),
    };
    const expression = '10/2 * * ? * *';
    const interval = CronExpression.parse(expression, options);
    for (let i = 10; i < 60; i += 2) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getSeconds()).toEqual(i));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should throw error for expression missing fields when in strict mode (#244)', () => {
    const expression = '20 15 * *';
    expect(() => CronExpression.parse(expression, { strict: true })).toThrow();
  });

  it('should correctly handle 0 12 1-31 * 1 strict (#284)', () => {
    // At 12:00 on every day-of-month from 1 through 31 and on Monday.
    const options = {
      currentDate: new CronDate('Mon, 12 Sep 2022 14:00:00', 'UTC'),
      strict: true,
    };
    //                               1 2 3   4   5 6
    const expression = '0 0 12 1-31 * 1';
    // const interval = CronExpression.parse(expression, options);
    expect(() => CronExpression.parse(expression, options)).toThrow('Cannot use both dayOfMonth and dayOfWeek together in strict mode!');
  });

  it('should correctly handle 0 12 1-31 * 1 non-strict (#284)', () => {
    // At 12:00 on Monday.
    const options = {
      currentDate: new CronDate('Sun, 30 Oct 2022 14:00:00', 'UTC'),
    };
    const expression = '0 12 1-31 * 1';
    const interval = CronExpression.parse(expression, options);
    const expected = [31, 1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < expected.length; i++) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getUTCDate()).toEqual(expected[i]));
    }
    expect(interval.toString()).toEqual(expression);
  });

  it('should correctly handle 0 12 * * 1 (#284)', () => {
    // At 12:00 on Monday.
    const options = {
      currentDate: new CronDate('Sun, 30 Oct 2022 14:00:00', 'UTC'),
    };
    const expression = '0 12 * * 1';
    const interval = CronExpression.parse(expression, options);
    const expected = [31, 7, 14, 21, 28];
    for (let i = 0; i < expected.length; i++) {
      cronDateTypedTest(interval.next(), (date) => expect(date.getUTCDate()).toEqual(expected[i]));
    }
    expect(interval.toString()).toEqual(expression);
  });

  describe('CronExpression - empty around comma tests', () => {
    const options = {
      utc: true,
    };

    test('both empty around comma', () => {
      expect(() => {
        CronExpression.parse('*/10 * * * * ,', options);
      }).toThrow(new Error('Invalid list value format'));
    });

    test('one side empty around comma', () => {
      expect(() => {
        CronExpression.parse('*/10 * * * * ,2', options);
      }).toThrow(new Error('Invalid list value format'));
    });
  });

  describe('CronExpression - mutation tests', () => {
    test('Fields are exposed', () => {
      const interval = CronExpression.parse('0 1 2 3 * 1-3,5');
      expect(interval).toBeTruthy();

      // CronExpression.map.forEach((field) => {
      //   Object.defineProperty(interval.fields, field, {
      //     value: [],
      //     writable: false,
      //   });
      //
      //
      //   const key = field as keyof CronFieldCollection;
      //   const expected = Array.from(interval.fields[key] as number[]);
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   interval.fields[key].push(-1);
      //   expect(interval.fields[key]).toEqual(expected);
      //   delete interval.fields[key];
      //   expect(interval.fields[key]).toEqual(expected);
      // });

      // interval.fields['dummy' as keyof CronFieldCollection] = [];
      expect(interval.fields['dummy' as keyof CronFieldCollection]).toBeUndefined();
      expect(interval.fields.second.values).toEqual([0]);
      expect(interval.fields.minute.values).toEqual([1]);
      expect(interval.fields.hour.values).toEqual([2]);
      expect(interval.fields.dayOfMonth.values).toEqual([3]);
      expect(interval.fields.month.values).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ]);
      expect(interval.fields.dayOfWeek.values).toEqual([1, 2, 3, 5]);
    });
  });

  describe('Leap Year', () => {
    const cronDateTypedTest = (date: unknown, testFn: (date: CronDate) => void): void => {
      if (!(date instanceof CronDate)) {
        throw new Error('date is not instance of CronDate');
      }
      testFn(date);
    };

    it('should handle leap year with starting date 0 0 29 2 *', function () {
      const options = {
        currentDate: new Date(2020, 0, 1),
      };
      const interval = CronExpression.parse('0 0 29 2 *', options);
      // let d;
      for (let i = 0; i < 20; ++i) {
        cronDateTypedTest(interval.next(), (date) => expect(date.getDate()).toEqual(29));
      }
    });
    it('should handle leap year without starting date 0 0 29 2 *', function () {
      // note if you use console.log to check the date, it will show yyyy-mm-dd hh:mm:ss where dd will likely be 28
      // as the date will log out in local time, not UTC
      const interval = CronExpression.parse('0 0 29 2 *');
      for (let i = 0; i < 20; ++i) {
        cronDateTypedTest(interval.next(), (date) => expect(date.getDate()).toEqual(29));
      }
    });
  });

  describe('prev date', () => {
    test('prev should match correctly (issue #98) when milliseconds are greater than 0', function () {
      const options = {
        currentDate: new Date('2017-06-13T18:21:25.002Z'),
      };

      const interval = CronExpression.parse('*/5 * * * * *', options);
      const prev = interval.prev();
      if (!(prev instanceof CronDate)) {
        throw new Error('Expected prev to be an instance of CronDate');
      }
      expect(prev.getSeconds()).toEqual(25);
    });

    test('prev should match correctly (issue #98) when milliseconds are equal to 0', function () {
      const interval = CronExpression.parse('59 59 23 * * *', {
        currentDate: new Date('2012-12-26 14:38:53'),
      });

      [25, 24, 23, 22].forEach(function (date) {
        const prev = interval.prev();
        if (!(prev instanceof CronDate)) {
          throw new Error('Expected prev to be an instance of CronDate');
        }
        expect(prev.getFullYear()).toEqual(2012);
        expect(prev.getMonth()).toEqual(11);
        expect(prev.getDate()).toEqual(date);
        expect(prev.getHours()).toEqual(23);
        expect(prev.getMinutes()).toEqual(59);
        expect(prev.getSeconds()).toEqual(59);
      });
    });
  });

  describe('timezones and DST tests', () => {
    test('It works on DST start', () => {
      const options: CronParseOptions = {
        currentDate: '2016-03-27 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      let interval: CronExpression;
      let date: CronDate | { value: CronDate; done: boolean };

      interval = CronExpression.parse('0 * * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(5); // 5 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      interval = CronExpression.parse('30 2 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(30); // 30 Minutes
      expect(date.getHours()).toEqual(2); // 2 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(30); // 30 Minutes
      expect(date.getHours()).toEqual(2); // 2 AM
      expect(date.getDate()).toEqual(28); // on the 28th

      interval = CronExpression.parse('0 3 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(3); // 3 on the 28th
      expect(date.getDate()).toEqual(28); // on the 28th

      interval = CronExpression.parse('*/20 3 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(20); // 20 Minutes
      expect(date.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(40); // 20 Minutes
      expect(date.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(3); // 3 AM
      expect(date.getDate()).toEqual(28); // on the 28th

      options.currentDate = '2016-03-27 00:00:01';

      interval = CronExpression.parse('0 * 27 * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(1); // 1 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(2); // 2 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(4); // 4 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(5); // 5 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      options.currentDate = '2016-03-27 00:00:01';
      options.endDate = '2016-03-27 03:00:01';

      interval = CronExpression.parse('0 * * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(1); // 1 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(2); // 2 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0); // 0 Minutes
      expect(date.getHours()).toEqual(4); // 4 AM
      expect(date.getDate()).toEqual(27); // on the 27th

      // Out of the timespan range
      expect(() => interval.next()).toThrow();
    });

    test('It works on DST end 2016-10-30 02:00:01 - 0 * * * *', function () {
      const options: CronParseOptions = {
        currentDate: '2016-10-30 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression  = CronExpression.parse('0 * * * *', options);
      let date: CronDate | { value: CronDate; done: boolean };
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3);
      expect(date.getDate()).toEqual(30);

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3); // Due to DST end in Athens (4-->3)
      expect(date.getDate()).toEqual(30);

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(4);
      expect(date.getDate()).toEqual(30);
    });

    test('It works on DST end 2016-10-30 02:00:01 - 0 3 * * *', function () {
      const options: CronParseOptions = {
        currentDate: '2016-10-30 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression = CronExpression.parse('0 3 * * *', options);
      let date: CronDate | { value: CronDate; done: boolean };

      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3);
      expect(date.getDate()).toEqual(30);

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3);
      expect(date.getDate()).toEqual(31);
    });

    test('It works on DST end 2016-10-30 02:00:01 - */20 3 * * *', function () {
      const options: CronParseOptions = {
        currentDate: '2016-10-30 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression = CronExpression.parse('*/20 3 * * *', options);
      let date: CronDate | { value: CronDate; done: boolean };

      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0);
      expect(date.getHours()).toEqual(3);
      expect(date.getDate()).toEqual(30);

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(20);
      expect(date.getHours()).toEqual(3);
      expect(date.getDate()).toEqual(30);

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(40);
      expect(date.getHours()).toEqual(3);
      expect(date.getDate()).toEqual(30);

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getMinutes()).toEqual(0);
      expect(date.getHours()).toEqual(3);
      expect(date.getDate()).toEqual(31);
    });

    test('It works on DST end 2016-10-30 00:00:01 - 0 * 30 * *', function () {
      const options: CronParseOptions = {
        currentDate: '2016-10-30 00:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression = CronExpression.parse('0 * 30 * *', options);
      let date: CronDate | { value: CronDate; done: boolean };

      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(1); // 1 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(2); // 2 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3); // 3 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3); // 3 AM (DST end)
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(4); // 4 AM
      expect(date.getDate()).toEqual(30); // on the 30th
    });

    test('It works on DST end 2016-10-30 00:00:01 - 0 * * * *  DST offset via ISO 8601 format', function () {
      // specify the DST offset via ISO 8601 format, as 3am is repeated
      const options: CronParseOptions = {
        currentDate: '2016-10-30 00:00:01',
        endDate: '2016-10-30T03:00:01+03',
        tz: 'Europe/Athens',
      };

      let interval: CronExpression = CronExpression.parse('0 * * * *', options);
      let date: CronDate | { value: CronDate; done: boolean };
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(1); // 1 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(2); // 2 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3); // 3 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      // Out of the timespan range
      expect(() => interval.next()).toThrow();

      options.endDate = '2016-10-30 04:00:01';

      interval = CronExpression.parse('0 * * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(1); // 1 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(2); // 2 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3); // 3 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(3); // 3 AM (DST end)
      expect(date.getDate()).toEqual(30); // on the 30th

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(4); // 4 AM
      expect(date.getDate()).toEqual(30); // on the 30th

      // Out of the timespan range
      expect(() => interval.next()).toThrow();

      options.currentDate = new Date('Sun Oct 29 2016 01:00:00 GMT+0200');
      options.endDate = undefined;
      // options.tz = undefined;

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(29); // on the 29th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(30); // on the 30th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 29 2016 02:59:00 GMT+0200');


      interval = CronExpression.parse('0 12 * * *', options);
      // t.ok(interval, 'Interval parsed');
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(29); // on the 29th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(30); // on the 30th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 29 2016 02:59:59 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(29); // on the 29th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(30); // on the 30th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 01:00:00 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(30); // on the 30th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 01:59:00 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(30); // on the 30th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 01:59:59 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(30); // on the 30th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 02:59:00 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(30); // on the 30th
      date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getHours()).toEqual(12); // 12 PM
      expect(date.getDate()).toEqual(31); // on the 31st
    }, 10000);

    test('it will work with #131 issue case', function () {
      const options: CronParseOptions = {
        tz: 'America/Sao_Paulo',
        currentDate: new Date('Sun Oct 30 2018 02:59:00 GMT+0200'),
        endDate: undefined,
      };

      const interval = CronExpression.parse('0 9 1 1 *', options);
      let date = interval.next();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }

      expect(date.getFullYear()).toEqual(2019);
      expect(date.getDate()).toEqual(1);
      expect(date.getMonth()).toEqual(0);

      date = interval.prev();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getFullYear()).toEqual(2018);
      expect(date.getDate()).toEqual(1);
      expect(date.getMonth()).toEqual(0);

      date = interval.prev();
      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getFullYear()).toEqual(2017);
      expect(date.getDate()).toEqual(1);
      expect(date.getMonth()).toEqual(0);
    }, 10000);

    test('it will work with #137 issue case', function () {
      const options: CronParseOptions = {
        tz: 'America/New_York',
        currentDate: new Date('10/28/2018'),
        endDate: undefined,
      };

      const interval = CronExpression.parse('0 12 * * 3', options);
      const date = interval.next();

      if (!(date instanceof CronDate)) {
        throw new Error('date is not a CronDate');
      }
      expect(date.getFullYear()).toEqual(2018);
      expect(date.getDate()).toEqual(31);
      expect(date.getMonth()).toEqual(9);

    }, 10000);
  });

  describe('expression 31 of month', () => {
    test('should correctly iterate through the next 20 occurrences', () => {
      const options = {
        currentDate: new CronDate('2100-10-31T00:00:00', 'UTC'),
      };
      const expected = (new Date('2103-08-31T00:00:00-0000')).toString();

      const interval = CronExpression.parse('0 0 31 * *', options);
      let d: CronDate | { value: CronDate; done: boolean };
      let result = '';
      for (let i = 0; i < 20; ++i) {
        d = interval.next();
        result = d.toString();
      }
      expect(result).toBe(expected);
    });
  });

  describe('bugs', () => {
    test('bug # ? - parse expression as UTC', () => {
      try {
        const options = { utc: true };

        const interval = CronExpression.parse('0 0 10 * * *', options);

        const date = interval.next();
        expect(date).toBeInstanceOf(CronDate);
        if (date instanceof CronDate) {
          expect(date.getUTCHours()).toEqual(10);
        }

        const interval2 = CronExpression.parse('0 */5 * * * *', options);

        const date2 = interval2.next();
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5 - (now.getMinutes() % 5));
        expect(date2).toBeInstanceOf(CronDate);
        if (date2 instanceof CronDate) {
          expect(date2.getHours()).toEqual(now.getUTCHours());
        }

      } catch (err) {
        expect(err).toBeNull();
      }
    });
  });
});
