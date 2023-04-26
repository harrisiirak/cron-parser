process.env.TZ = 'UTC';

import {CronDate, CronExpression} from '../src';
import {CronParserOptions} from '../src/types';

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
    expect(() => CronExpression.parse('-1 * * * * *')).toThrow('Constraint error, got value -1 expected range 0-59');
  });

  test('invalid range', function () {
    expect(() => CronExpression.parse('- * * * * *')).toThrow('Invalid range: -');
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
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53')
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
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53')
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
    const options = <CronParserOptions>{
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      startDate: new CronDate('Wed, 26 Dec 2012 12:40:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 16:40:00')
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
    prev = interval.prev();
    cronDateTypedTest(prev, (date) => {
      expect(date.getHours()).toEqual(12); // 'Hour matches'
      expect(date.getMinutes()).toEqual(40); // 'Minute matches'
    });
    expect(() => interval.prev()).toThrow(); // 'Should fail'
  });

  test('reset to given date', function () {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53')
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
      utc: true
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
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53')
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
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00')
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
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00')
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
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00')
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
      currentDate: '2019-06-01T11:00:00.000'
    });

    const firstExpectedDates = [
      new CronDate('2019-06-01T12:00:00.000'),
      new CronDate('2019-06-06T12:00:00.000'),
      new CronDate('2019-06-11T12:00:00.000'),
      new CronDate('2019-06-16T12:00:00.000'),
      new CronDate('2019-06-21T12:00:00.000'),
      new CronDate('2019-06-26T12:00:00.000'),
      new CronDate('2020-06-01T12:00:00.000')
    ];

    firstExpectedDates.forEach(function (expectedDate) {
      cronDateTypedTest(firstIterator.next(), (date) => {
        expect(expectedDate.toISOString()).toEqual(date.toISOString());
      });
    });

    const secondIterator = CronExpression.parse('0 15 */5 5 *', {
      currentDate: '2019-05-01T11:00:00.000'
    });

    const secondExpectedDates = [
      new CronDate('2019-05-01T15:00:00.000'),
      new CronDate('2019-05-06T15:00:00.000'),
      new CronDate('2019-05-11T15:00:00.000'),
      new CronDate('2019-05-16T15:00:00.000'),
      new CronDate('2019-05-21T15:00:00.000'),
      new CronDate('2019-05-26T15:00:00.000'),
      new CronDate('2019-05-31T15:00:00.000'),
      new CronDate('2020-05-01T15:00:00.000')
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
    const interval = CronExpression.parse('10 2 ? * 3');
    let next = interval.next();

    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect(date.getDay() === 3).toBeTruthy()); // 'day of week matches'

    next = interval.next();
    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect(date.getDay() === 3).toBeTruthy()); // 'day of week matches'

    next = interval.next();
    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect(date.getDay() === 3).toBeTruthy()); // 'day of week matches'

    next = interval.next();
    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect(date.getDay() === 3).toBeTruthy()); // 'day of week matches'

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

    // t.ok(next, 'Found next scheduled interal');
    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect((date.getDate() === 3 || date.getDate() === 6) && date.getDate() !== prevDate).toBeTruthy()); // 'date matches and is not previous date'

    if (!(next instanceof CronDate)) {
      throw new Error('next is not a CronDate');
    }

    prevDate = next.getDate();

    next = interval.next();
    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect((date.getDate() === 3 || date.getDate() === 6) && date.getDate() !== prevDate).toBeTruthy()); // 'date matches and is not previous date'

    if (!(next instanceof CronDate)) {
      throw new Error('next is not a CronDate');
    }

    prevDate = next.getDate();

    next = interval.next();
    expect(next).toBeTruthy();
    cronDateTypedTest(next, (date) => expect((date.getDate() === 3 || date.getDate() === 6) && date.getDate() !== prevDate).toBeTruthy()); // 'date matches and is not previous date'
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
      currentDate: new CronDate('Mon, 31 May 2021 12:00:00')
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
      currentDate: new CronDate('Sat, 1 Dec 2012 14:38:53')
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
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53')
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
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53')
    };
    const interval = CronExpression.parse('10 2 12 8 6-7', options);

    let next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 6).toBeTruthy(); // 'Day of week matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 0).toBeTruthy(); // 'Day of week matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 6).toBeTruthy(); // 'Day of week matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 0).toBeTruthy(); // 'Day of week matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getDate()).toEqual(12); // 'Day of month matches'
      expect(next.getDay() === 1).toBeTruthy(); // 'Day of week matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });

    next = interval.next();
    cronDateTypedTest(next, (next) => {
      expect(next.getDay() === 6).toBeTruthy(); // 'Day of week matches'
      expect(next.getMonth()).toEqual(7); // 'Month matches'
    });
  });

  test('day of month validation should be ignored when day of month is wildcard and month is set', function () {
    const options = {
      currentDate: new CronDate('2020-05-01T15:00:00.000')
    };
    const interval = CronExpression.parse('* * * * 2 *', options);

    const next = interval.next();

    cronDateTypedTest(next, (next) => {
      expect(next.getHours()).toEqual(0); // 'Hours matches'
      expect(next.getDate()).toEqual(1); // 'Day of month matches'
      expect(next.getMonth() + 1).toEqual(2); // 'Month matches'
    });

  });

  test('day and date in week should matches', function () {
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
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53')
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
      iterator: true
    };

    let val = null;
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
      '30 16 * * 7,6'
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
      '0 1,9,11 * * *'
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
      tz: 'Europe/Madrid'
    };

    const interval = CronExpression.parse('0 0 0 1,2 * *', options);
    const date = interval.next();

    cronDateTypedTest(date, (date) => {
      expect(date.getFullYear()).toEqual(2018);
      expect(date.getDate()).toEqual(1);
      expect(date.getMonth()).toEqual(11);
    });
  });

  test('should work for valid first/second/third/fourth/fifth occurence dayOfWeek (# char)', function () {
    const options = {
      currentDate: new CronDate('2019-04-30')
    };

    const expectedFirstDates = [
      new CronDate('2019-05-05'),
      new CronDate('2019-06-02'),
      new CronDate('2019-07-07'),
      new CronDate('2019-08-04')
    ];
    const expectedSecondDates = [
      new CronDate('2019-05-12'),
      new CronDate('2019-06-09'),
      new CronDate('2019-07-14'),
      new CronDate('2019-08-11')
    ];
    const expectedThirdDates = [
      new CronDate('2019-05-19'),
      new CronDate('2019-06-16'),
      new CronDate('2019-07-21'),
      new CronDate('2019-08-18')
    ];
    const expectedFourthDates = [
      new CronDate('2019-05-26'),
      new CronDate('2019-06-23'),
      new CronDate('2019-07-28'),
      new CronDate('2019-08-25')
    ];
    const expectedFifthDates = [
      new CronDate('2019-06-30'),
      new CronDate('2019-09-29'),
      new CronDate('2019-12-29'),
      new CronDate('2020-03-29')
    ];

    const allExpectedDates = [
      expectedFirstDates,
      expectedSecondDates,
      expectedThirdDates,
      expectedFourthDates,
      expectedFifthDates
    ];
    const expressions = [
      '0 0 0 ? * 0#1',
      '0 0 0 ? * 0#2',
      '0 0 0 ? * 0#3',
      '0 0 0 ? * 0#4',
      '0 0 0 ? * 0#5'
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

  test('should work for valid second sunday in may', function () {
    const options = {
      currentDate: new CronDate('2019-01-30')
    };
    const expectedDates = [
      new CronDate('2019-05-12'),
      new CronDate('2020-05-10'),
      new CronDate('2021-05-09'),
      new CronDate('2022-05-08')
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

  test('should work for valid second sunday at noon in may', function () {
    const options = {
      currentDate: new CronDate('2019-05-12T11:59:00.000')
    };
    const expected = new CronDate('2019-05-12T12:00:00.000');

    const interval = CronExpression.parse('0 0 12 ? MAY 0#2', options);
    const date = interval.next();
    cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
  });

  test('should work for valid second sunday at noon in may (UTC+3)', function () {
    const options = {
      currentDate: new CronDate('2019-05-12T11:59:00.000', 'Europe/Sofia')
    };
    const expected = new CronDate('2019-05-12T12:00:00.000', 'Europe/Sofia');

    const interval = CronExpression.parse('0 0 12 ? MAY 0#2', options);
    const date = interval.next();
    cronDateTypedTest(date, (date) => expect(date.toISOString()).toEqual(expected.toISOString())); // 'Date matches'
  });

  test('should work with both dayOfMonth and nth occurence of dayOfWeek', function () {
    const options = {
      currentDate: new CronDate('2019-04-01')
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

  test('should error when passed invalid occurence value', function () {
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

  // The Quartz documentation says that if the # character is used then no other expression can be used in the dayOfWeek term: http://www.quartz-scheduler.org/api/2.3.0/index.html
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
});
