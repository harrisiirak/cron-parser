import { CronDate } from '../src/CronDate';
import { CronExpression } from '../src/CronExpression';
import { CronFieldCollection } from '../src/CronFieldCollection';
import { CronOptions } from '../src/types';

describe('CronExpression', () => {
  describe('invalid expression', () => {
    test('value out of the range', () => {
      expect(() => CronExpression.parse('61 * * * * *')).toThrow('Constraint error, got value 61 expected range 0-59');
    });

    test('second value out of the range', () => {
      expect(() => CronExpression.parse('-1 * * * * *')).toThrow('Constraint error, got range NaN-1 expected range 0-59');
    });

    test('invalid range', () => {
      expect(() => CronExpression.parse('- * * * * *')).toThrow('Constraint error, got range NaN-NaN expected range 0-59');
    });

    test('minute value out of the range', () => {
      expect(() => CronExpression.parse('* 32,72 * * * *')).toThrow('Constraint error, got value 72 expected range 0-59');
    });

    test('hour value out of the range', () => {
      expect(() => CronExpression.parse('* * 12-36 * * *')).toThrow('Constraint error, got range 12-36 expected range 0-23');
    });

    test('day of the month value out of the range', () => {
      expect(() => CronExpression.parse('* * * 10-15,40 * *')).toThrow('Constraint error, got value 40 expected range 1-31');
    });

    test('month value out of the range', () => {
      expect(() => CronExpression.parse('* * * * */10,12-13 *')).toThrow('Constraint error, got range 12-13 expected range 1-12');
    });

    test('day of the week value out of the range', () => {
      expect(() => CronExpression.parse('* * * * * 9')).toThrow('Constraint error, got value 9 expected range 0-7');
    });

    test('invalid expression that contains too many fields', () => {
      expect(() => CronExpression.parse('* * * * * * * *ASD')).toThrow('Invalid cron expression');
    });

    test('invalid explicit day of month definition', () => {
      expect(() => {
        const iter = CronExpression.parse('0 0 31 4 *');
        iter.next();
      }).toThrow('Invalid explicit day of month definition');
    });

    test('invalid characters test - symbol', () => {
      expect(() => CronExpression.parse('10 ! 12 8 0')).toThrow('Invalid characters, got value: !');
    });

    test('invalid characters test - letter', () => {
      expect(() => CronExpression.parse('10 x 12 8 0')).toThrow('Invalid characters, got value: x');
    });

    test('invalid characters test - parentheses', () => {
      expect(() => CronExpression.parse('10 ) 12 8 0')).toThrow('Invalid characters, got value: )');
    });

    test('interval with invalid characters test', () => {
      expect(() => CronExpression.parse('10 */A 12 8 0')).toThrow('Invalid characters, got value: */A');
    });

    test('range with invalid characters test', () => {
      expect(() => CronExpression.parse('10 0-z 12 8 0')).toThrow('Invalid characters, got value: 0-z');
    });

    test('group with invalid characters test', () => {
      expect(() => CronExpression.parse('10 0,1,z 12 8 0')).toThrow('Invalid characters, got value: 0,1,z');
    });

    test('invalid expression which has repeat 0 times', () => {
      expect(() => CronExpression.parse('0 */0 * * *')).toThrow('Constraint error, cannot repeat at every 0 time.');
    });

    test('invalid expression which has repeat negative number times', () => {
      expect(() => CronExpression.parse('0 */-5 * * *')).toThrow('Constraint error, cannot repeat at every -5 time.');
    });

    test('invalid expression which has multiple combined repeat cycles', () => {
      expect(() => CronExpression.parse('0 5/5/5 * * *')).toThrow('Invalid repeat: 5/5/5');
    });

    test('invalid days of week strings - wrong alias', () => {
      expect(() => CronExpression.parse('15 10 * * MON-TUR')).toThrow('Validation error, cannot resolve alias "tur"');
    });

    test('invalid list value without value', () => {
      expect(() => {
        CronExpression.parse('*/10 * * * * ,');
      }).toThrow(new Error('Invalid list value format'));
    });

    test('invalid list value with right-side value', () => {
      expect(() => {
        CronExpression.parse('*/10 * * * * ,2');
      }).toThrow(new Error('Invalid list value format'));
    });
    // The Quartz documentation says that if the # character is used then no other expression can be used in the dayOfWeek term:
    // http://www.quartz-scheduler.org/api/2.3.0/index.html
    test('cannot combine `-` range and # occurrence special characters', () => {
      const expression = '0 0 0 ? * 2-4#2';
      expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek `#` and `-` special characters are incompatible');
    });

    test('cannot combine `/` repeat interval and # occurrence special characters', () => {
      const expression = '0 0 0 ? * 1/2#3';
      expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek `#` and `/` special characters are incompatible');
    });

    test('cannot combine `,` list and # occurrence special characters', () => {
      const expression = '0 0 0 ? * 0,6#4';
      expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek `#` and `,` special characters are incompatible');
    });

    test('invalid occurrence value', () => {
      const expressions = [
        '0 0 0 ? * 1#',
        '0 0 0 ? * 1#0',
        '0 0 0 ? * 4#6',
        '0 0 0 ? * 0##4',
      ];
      for (const expression of expressions) {
        expect(() => CronExpression.parse(expression)).toThrow('Constraint error, invalid dayOfWeek occurrence number (#)');
      }
    });

    test('missing fields when in strict mode', () => {
      const expression = '20 15 * *';
      expect(() => CronExpression.parse(expression, { strict: true })).toThrow();
    });

  });

  describe('take multiple dates', () => {
    test('step', () => {
      const options = {
        currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      };
      const interval = CronExpression.parse('6/23 * * * *', options);

      let next = interval.next();
      expect(next.getMinutes()).toEqual(52);
      next = interval.next();
      expect(next.getMinutes()).toEqual(6);
      next = interval.next();
      expect(next.getMinutes()).toEqual(29);
      next = interval.next();
      expect(next.getMinutes()).toEqual(52);
    });

    test('range', () => {
      const interval = CronExpression.parse('10-30 2 12 8 0');
      const intervals = interval.take(20);

      for (let i = 0, c = intervals.length; i < c; i++) {
        const next = intervals[i];
        expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy();
        expect(next.getMonth()).toEqual(7);
        expect(next.getHours()).toEqual(2);
        expect(next.getMinutes()).toEqual(10 + i);
      }
    });

    test('incremental range with step', () => {
      const interval = CronExpression.parse('10-30/2 2 12 8 0');
      const intervals = interval.take(10);

      for (let i = 0, c = intervals.length; i < c; i++) {
        const next = intervals[i];
        expect(next).toBeTruthy();
        expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
        expect(next.getMonth()).toEqual(7);
        expect(next.getHours()).toEqual(2);
        expect(next.getMinutes()).toEqual(10 + (i * 2));
      }
    });

    test('limited with start and end date', () => {
      const options = <CronOptions>{
        currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
        startDate: new CronDate('Wed, 26 Dec 2012 12:40:00'),
        endDate: new CronDate('Wed, 26 Dec 2012 16:40:00'),
        tz: 'UTC',
      };

      const interval = CronExpression.parse('*/20 * * * *', options);
      const expected = [
        '2012-12-26T14:40:00.000Z',
        '2012-12-26T15:00:00.000Z',
        '2012-12-26T15:20:00.000Z',
        '2012-12-26T15:40:00.000Z',
        '2012-12-26T16:00:00.000Z',
      ];

      for (const date of interval.take(5)) {
        expect(date.toISOString()).toEqual(expected.shift());
      }
    });
  });

  test('valid ES6 iterator should be returned', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
      iterator: true,
    };

    const interval = CronExpression.parse('*/25 * * * *', options);
    const iterator = interval[Symbol.iterator]();

    let val: IteratorResult<CronDate> = iterator.next();
    expect(val).not.toBeNull();
    expect(val.value).toBeTruthy();
    expect(val.done).toBeFalsy();

    val = iterator.next();
    expect(val).not.toBeNull();
    expect(val.value).toBeTruthy();
    expect(val.done).toBeFalsy();

    val = iterator.next();
    expect(val).not.toBeNull();
    expect(val.value).toBeTruthy();
    expect(val.done).toBeTruthy();
  });

  test('empty expression', () => {
    const interval = CronExpression.parse('');
    const date = new CronDate();
    date.addMinute();

    const next = interval.next();
    expect(next).toBeInstanceOf(CronDate);
    expect(date.getMinutes()).toEqual(date.getMinutes());
  });

  test('default expression', () => {
    const interval = CronExpression.parse('* * * * *');
    const date = new CronDate();
    date.addMinute();

    const next = interval.next();
    expect(next).toBeInstanceOf(CronDate);
    expect(date.getMinutes()).toEqual(date.getMinutes());
  });

  test('default expression (tab as field separator)', () => {
    const interval = CronExpression.parse('*	*	*	*	*');
    const date = new CronDate();
    date.addMinute();

    const next = interval.next();
    expect(next).toBeInstanceOf(CronDate);
    expect(date.getMinutes()).toEqual(date.getMinutes());
  });

  test('default expression (mixed tab and space usage)', () => {
    const interval = CronExpression.parse('* \t    *\t \t  *   *  \t \t  *');
    const date = new CronDate();
    date.addMinute();

    const next = interval.next();
    expect(next).toBeInstanceOf(CronDate);
    expect(date.getMinutes()).toEqual(date.getMinutes());
  });

  test('incremental minutes expression test', () => {
    const interval = CronExpression.parse('*/3 * * * *');
    const next = interval.next();
    expect(next).toBeInstanceOf(CronDate);
    expect(next.getMinutes() % 3).toEqual(0);
  });

  test('fixed expression test', () => {
    const interval = CronExpression.parse('10 2 12 8 0');
    const next = interval.next();
    expect(next).toBeInstanceOf(CronDate);
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 
    expect(next.getHours()).toEqual(2); 
    expect(next.getMinutes()).toEqual(10);
  });

  test('range test with non-standard value and repeat (second)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('0/30 * * * * ?', options);

    let next = interval.next();
    expect(next.getSeconds()).toEqual(0);

    next = interval.next();
    expect(next.getSeconds()).toEqual(30);

    next = interval.next();
    expect(next.getSeconds()).toEqual(0);
  });

  test('range test with non-standard value and repeat (second)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:00'),
    };
    const interval = CronExpression.parse('1/2 * * * * ?', options);

    let next = interval.next();
    expect(next.getSeconds()).toEqual(1);

    next = interval.next();
    expect(next.getSeconds()).toEqual(3);

    next = interval.next();
    expect(next.getSeconds()).toEqual(5);
  });

  test('range with the same start and end value', () => {
    const interval = CronExpression.parse('*/10 2-2 * * *');
    expect(interval).toBeTruthy();
  });

  test('predefined expression', () => {
    const interval = CronExpression.parse('@yearly');
    const date = new CronDate();
    date.addYear();

    const next = interval.next();
    expect(next.getFullYear()).toEqual(date.getFullYear());
  });

  test('limited with start and end date in forward direction', () => {
    const options = <CronOptions>{
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      startDate: new CronDate('Wed, 26 Dec 2012 12:40:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 16:40:00'),
    };

    const interval = CronExpression.parse('*/20 * * * *', options);

    const dates1 = interval.take(10);
    expect(dates1.length).toEqual(7); // 'Dates count matches for positive iteration'

    interval.reset();

    const dates2 = interval.take(-10);
    expect(dates2.length).toEqual(6); // 'Dates count matches for negative iteration'

    interval.reset();

    // Forward iteration
    let next = interval.next();
    expect(next.getHours()).toEqual(14); 
    expect(next.getMinutes()).toEqual(40);
    next = interval.next();
    expect(next.getHours()).toEqual(15); 
    expect(next.getMinutes()).toEqual(0);
    next = interval.next();
    expect(next.getHours()).toEqual(15); 
    expect(next.getMinutes()).toEqual(20);
    next = interval.next();
    expect(next.getHours()).toEqual(15); 
    expect(next.getMinutes()).toEqual(40);
    next = interval.next();
    expect(next.getHours()).toEqual(16); 
    expect(next.getMinutes()).toEqual(0);
    next = interval.next();
    expect(next.getHours()).toEqual(16); 
    expect(next.getMinutes()).toEqual(20);
    next = interval.next();
    expect(next.getHours()).toEqual(16); 
    expect(next.getMinutes()).toEqual(40);
    expect(() => interval.next()).toThrow(); // 'Should fail'

    next = interval.prev();
    expect(next.getHours()).toEqual(16); 
    expect(next.getMinutes()).toEqual(20);
  });

  test('limited with start and end date in backwards direction', () => {
    const options = <CronOptions>{
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
      startDate: new CronDate('Wed, 26 Dec 2012 12:40:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 16:40:00'),
    };

    const interval = CronExpression.parse('*/20 * * * *', options);

    // Backward iteration
    let prev = interval.prev();
    expect(prev.getHours()).toEqual(14); 
    expect(prev.getMinutes()).toEqual(20);
    prev = interval.prev();
    expect(prev.getHours()).toEqual(14); 
    expect(prev.getMinutes()).toEqual(0);
    prev = interval.prev();
    expect(prev.getHours()).toEqual(13); 
    expect(prev.getMinutes()).toEqual(40);
    prev = interval.prev();
    expect(prev.getHours()).toEqual(13); 
    expect(prev.getMinutes()).toEqual(20);
    prev = interval.prev();
    expect(prev.getHours()).toEqual(13); 
    expect(prev.getMinutes()).toEqual(0);
    expect(interval.hasPrev()).toBe(true);
    prev = interval.prev();
    expect(prev.getHours()).toEqual(12); 
    expect(prev.getMinutes()).toEqual(40);
    expect(interval.hasPrev()).toBe(false);
    expect(() => interval.prev()).toThrow(); // 'Should fail'
  });

  test('reset to given date', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('*/20 * * * *', options);

    // Forward iteration
    let next = interval.next();
    expect(next.getHours()).toEqual(14); 
    expect(next.getMinutes()).toEqual(40);

    interval.reset(); // defaults to initial currentDate

    next = interval.next();
    expect(next.getHours()).toEqual(14); 
    expect(next.getMinutes()).toEqual(40);

    interval.reset(new CronDate('Wed, 26 Dec 2012 17:23:53'));

    next = interval.next();
    expect(next.getHours()).toEqual(17); 
    expect(next.getMinutes()).toEqual(40);

    next = interval.next();
    expect(next.getHours()).toEqual(18); 
    expect(next.getMinutes()).toEqual(0);

    interval.reset(new Date('2019-06-18T08:18:36.000'));

    next = interval.prev();
    expect(next.getDate()).toEqual(18); 
    expect(next.getHours()).toEqual(8); 
    expect(next.getMinutes()).toEqual(0);

    next = interval.prev();
    expect(next.getDate()).toEqual(18); 
    expect(next.getHours()).toEqual(7); 
    expect(next.getMinutes()).toEqual(40);
  });

  test('using days of week strings', () => {
    const interval = CronExpression.parse('15 10 * * MON-TUE');
    const intervals = interval.take(8);
    for (const next of intervals) {
      const day = next.getDay();
      expect(day === 1 || day === 2).toBeTruthy(); 
      expect(next.getHours()).toEqual(10); 
      expect(next.getMinutes()).toEqual(15);
    }
  });

  test('using mixed days of week strings', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };

    const interval = CronExpression.parse('15 10 * jAn-FeB mOn-tUE', options);
    const intervals = interval.take(8);
    for (const next of intervals) {
      const day = next.getDay();
      const month = next.getMonth();
      expect(month === 0 || month === 1).toBeTruthy(); 
      expect(day === 1 || day === 2).toBeTruthy(); 
      expect(next.getHours()).toEqual(10); 
      expect(next.getMinutes()).toEqual(15);
    }
  });

  test('using non-standard second field (wildcard)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
    };

    const interval = CronExpression.parse('* * * * * *', options);
    const intervals = interval.take(10);
    for (const [index, next] of intervals.entries()) {
      expect(next.getSeconds()).toEqual(index + 1);
    }
  });

  test('using non-standard second field (step)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
    };

    const interval = CronExpression.parse('*/20 * * * * *', options);
    const intervals = interval.take(3);
    expect(intervals[0].getSeconds()).toEqual(20);
    expect(intervals[1].getSeconds()).toEqual(40);
    expect(intervals[2].getSeconds()).toEqual(0);
  });

  test('using non-standard second field (range)', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:00'),
      endDate: new CronDate('Wed, 26 Dec 2012 15:40:00'),
    };

    const interval = CronExpression.parse('20-40/10 * * * * *', options);
    const intervals = interval.take(3);
    for (const [index, next] of intervals.entries()) {
      expect(next.getSeconds()).toEqual(20 + (index * 10));
    }
  });

  test('using explicit month definition and */5 day of month step', () => {
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
    for (const expectedDate of firstExpectedDates) {
      expect(expectedDate.toISOString()).toEqual(firstIterator.next().toISOString());
    }

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
    for (const expectedDate of secondExpectedDates) {
      expect(expectedDate.toISOString()).toEqual(secondIterator.next().toISOString());
    }
  });

  test('day of month and week are both set', () => {
    const interval = CronExpression.parse('10 2 12 8 0');
    let next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 
  });

  test('day of month is unspecified', () => {
    // At 02:10:00am, on every Wednesday, every month
    const expectedDates = [
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
    for (const expectedDate of expectedDates) {
      expect(interval.next().toISOString()).toEqual(expectedDate);
    }
  });

  test('day of week is unspecified', () => {
    const interval = CronExpression.parse('10 2 3,6 * ?');
    let next = interval.next();
    expect(next.getDate() === 3 || next.getDate() === 6).toBeTruthy();

    let prevDate = next.getDate();
    next = interval.next();
    expect((next.getDate() === 3 || next.getDate() === 6) && next.getDate() !== prevDate).toBeTruthy();
    prevDate = next.getDate();

    next = interval.next();
    expect(next).toBeTruthy();
    expect((next.getDate() === 3 || next.getDate() === 6) && next.getDate() !== prevDate).toBeTruthy();
    prevDate = next.getDate();

    next = interval.next();
    expect(next).toBeTruthy();
    expect((next.getDate() === 3 || next.getDate() === 6) && next.getDate() !== prevDate).toBeTruthy();
  });

  test('day of month and week are both set and dow is 7', () => {
    const interval = CronExpression.parse('10 2 12 8 7');

    let next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 
  });

  test('day of month is wildcard, month and day of week are both set', () => {
    const options = {
      currentDate: new CronDate('Mon, 31 May 2021 12:00:00'),
    };
    const interval = CronExpression.parse('0 0 * 6 2', options);
    const expectedDayMatches = [1, 8, 15, 22, 29];

    for (const dayOfMonth of expectedDayMatches) {
      const next = interval.next();
      expect(next.getDay()).toEqual(2);
      expect(next.getDate()).toEqual(dayOfMonth);
      expect(next.getMonth()).toEqual(5); 
    }
  });

  test('day of month contains multiple ranges and day of week is wildcard', () => {
    const options = {
      currentDate: new CronDate('Sat, 1 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('0 0 0 2-4,7-31 * *', options);

    let next = interval.next();
    expect(next.getDate()).toEqual(2); 
    expect(next.getMonth()).toEqual(11); 

    next = interval.next();
    expect(next.getDate()).toEqual(3); 
    expect(next.getMonth()).toEqual(11); 

    next = interval.next();
    expect(next.getDate()).toEqual(4); 
    expect(next.getMonth()).toEqual(11); 

    next = interval.next();
    expect(next.getDate()).toEqual(7); 
    expect(next.getMonth()).toEqual(11); 

    next = interval.next();
    expect(next.getDate()).toEqual(8); 
    expect(next.getMonth()).toEqual(11); 
    expect(() => interval.next()).not.toThrow();
  });

  test('day of month and week are both set and dow is 6,0', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('10 2 12 8 6,0', options);

    let next = interval.next();
    expect(next.getDay() === 6 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 6 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 

    next = interval.next();
    expect(next.getDay() === 0 || next.getDate() === 12).toBeTruthy(); 
    expect(next.getMonth()).toEqual(7); 
  });

  test('day of month and week are both set and dow is 6-7', () => {
    // if both "day of month" (field 3) and "day of week" (field 5) are restricted (not contain "*"), then one or both must match the current day.
    // At 02:10 AM, on day 12 of the month, Saturday through Sunday, only in August
    const expectedDates = [
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
    for (const expectedDate of expectedDates) {
      expect(next.toISOString()).toEqual(expectedDate);
      next = interval.next();
    }
  });

  test('day of month validation should be ignored when day of month is wildcard and month is set', () => {
    const options = {
      currentDate: new CronDate('2020-05-01T15:00:00.000'),
    };
    const interval = CronExpression.parse('* * * * 2 *', options);
    const next = interval.next();
    expect(next.getHours()).toEqual(0); 
    expect(next.getDate()).toEqual(1); 
    expect(next.getMonth() + 1).toEqual(2); 
  });

  test('day and date in week should match', () => {
    const interval = CronExpression.parse('0 1 1 1 * 1');

    let next = interval.next();
    expect(next.getHours()).toEqual(1); 
    expect(next.getDay() === 1 || next.getDate() === 1).toBeTruthy(); 

    next = interval.next();
    expect(next.getHours()).toEqual(1); 
    expect(next.getDay() === 1 || next.getDate() === 1).toBeTruthy(); 

    next = interval.next();
    expect(next.getHours()).toEqual(1); 
    expect(next.getDay() === 1 || next.getDate() === 1).toBeTruthy(); 
  });

  test('should sort ranges and values in ascending order', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };
    const interval = CronExpression.parse('0 12,13,10,1-3 * * *', options);
    const expectedHours = [1, 2, 3, 10, 12, 13];
    for (const expectedHour of expectedHours) {
      const next = interval.next();
      expect(next.getHours()).toEqual(expectedHour); 
    }
  });

  test('dow 6,7 6,0 0,6 7,6 should be equivalent', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 14:38:53'),
    };

    const expressions = [
      '30 16 * * 6,7',
      '30 16 * * 6,0',
      '30 16 * * 0,6',
      '30 16 * * 7,6',
    ];
    for (const expression of expressions) {
      const interval = CronExpression.parse(expression, options);
      let next = interval.next();
      expect(next.getDay() === 6).toBeTruthy(); 

      next = interval.next();
      expect(next.getDay() === 0).toBeTruthy();

      next = interval.next();
      expect(next.getDay() === 6).toBeTruthy(); 
    }
  });

  test('hour 0 9,11,1 * * * and 0 1,9,11 * * * should be equivalent', () => {
    const options = {
      currentDate: new CronDate('Wed, 26 Dec 2012 00:00:00'),
    };
    const expressions = [
      '0 9,11,1 * * *',
      '0 1,9,11 * * *',
    ];
    for (const expression of expressions) {
      const interval = CronExpression.parse(expression, options);
      let next = interval.next();
      expect(next.getHours()).toEqual(1);

      next = interval.next();
      expect(next.getHours()).toEqual(9);

      next = interval.next();
      expect(next.getHours()).toEqual(11);

      next = interval.next();
      expect(next.getHours()).toEqual(1);

      next = interval.next();
      expect(next.getHours()).toEqual(9);

      next = interval.next();
      expect(next.getHours()).toEqual(11);
    }
  });

  test('it will work with #139 issue case', () => {
    const options = {
      currentDate: new Date('2018-11-15T16:15:33.522Z'),
      tz: 'Europe/Madrid',
    };
    const interval = CronExpression.parse('0 0 0 1,2 * *', options);
    const next = interval.next();
    expect(next.getFullYear()).toEqual(2018);
    expect(next.getDate()).toEqual(1);
    expect(next.getMonth()).toEqual(11);
  });

  test('should work for valid first/second/third/fourth/fifth occurrence dayOfWeek (# char)', () => {
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
    for (const [index, expression] of expressions.entries()) {
      const interval = CronExpression.parse(expression, options);
      const expectedDates = allExpectedDates[index];

      for (const expectedDate of expectedDates) {
        const date = interval.next();
        expect(date.toISOString()).toEqual(expectedDate.toISOString());
      }

      expectedDates
        .slice(0, expectedDates.length - 1)
        .reverse()
        .forEach((expected) => {
          const date = interval.prev();
          expect(date.toISOString()).toEqual(expected.toISOString());
        });
    }
  });

  test('should work for valid second sunday in May', () => {
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
    for (const expectedDate of expectedDates) {
      const next = interval.next();
      expect(next.toISOString()).toEqual(expectedDate.toISOString());
    }
    expectedDates
      .slice(0, expectedDates.length - 1)
      .reverse()
      .forEach((expected) => {
        const next = interval.prev();
        expect(next.toISOString()).toEqual(expected.toISOString());
      });
  });

  test('should work for valid second sunday at noon in May', () => {
    const options = {
      currentDate: new CronDate('2019-05-12T11:59:00.000'),
    };
    const expected = new CronDate('2019-05-12T12:00:00.000');
    const interval = CronExpression.parse('0 0 12 ? MAY 0#2', options);
    const next = interval.next();
    expect(next.toISOString()).toEqual(expected.toISOString());
  });

  test('should work for valid second sunday at noon in May (UTC+3)', () => {
    const options = {
      currentDate: new CronDate('2019-05-12T11:59:00.000', 'Europe/Sofia'),
    };
    const expected = new CronDate('2019-05-12T12:00:00.000', 'Europe/Sofia');
    const interval = CronExpression.parse('0 0 12 ? MAY 0#2', options);
    const next = interval.next();
    expect(next.toISOString()).toEqual(expected.toISOString());
  });

  test('should work with both dayOfMonth and nth occurrence of dayOfWeek', () => {
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
    for (const expectedDate of expectedDates) {
      const next = interval.next();
      expect(next.toISOString()).toEqual(expectedDate.toISOString());
    }
    expectedDates
      .slice(0, expectedDates.length - 1)
      .reverse()
      .forEach((expected) => {
        const next = interval.prev();
        expect(next.toISOString()).toEqual(expected.toISOString());
      });
  });

  it('should correctly determine if a given expression includes a CronDate (#153 and #299)', () => {
    const expression = '* * 1-6 ? * *'; // 1am to 6am every day
    const goodDate = new CronDate('2019-01-01T01:00:00.000');
    const badDateBefore = new CronDate('2019-01-01T00:00:00.000');
    const badDateAfter = new CronDate('2019-01-01T07:00:00.000');
    const interval = CronExpression.parse(expression);
    expect(interval.includesDate(goodDate)).toBe(true);
    expect(interval.includesDate(badDateBefore)).toBe(false);
    expect(interval.includesDate(badDateAfter)).toBe(false);
  });

  test('correctly handle 0 12 1-31 * 1 (#284)', () => {
    // At 12:00 on Monday.
    const options = {
      currentDate: new CronDate('Sun, 30 Oct 2022 14:00:00', 'UTC'),
    };
    const expression = '0 12 1-31 * 1';
    const interval = CronExpression.parse(expression, options);
    const expectedDates = [31, 1, 2, 3, 4, 5, 6, 7];
    for (const expectedDate of expectedDates) {
      expect(interval.next().getUTCDate()).toEqual(expectedDate);
    }
    expect(interval.toString()).toEqual(expression);
  });

  test('fields are accessible', () => {
    const interval = CronExpression.parse('0 1 2 3 * 1-3,5');
    expect(interval).toBeTruthy();
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

  describe('Leap Year', () => {
    test('handle leap year with starting date 0 0 29 2 *', () => {
      const options = {
        currentDate: new Date(2020, 0, 1),
      };
      const interval = CronExpression.parse('0 0 29 2 *', options);
      for (let i = 0; i < 20; ++i) {
        expect(interval.next().getDate()).toEqual(29);
      }
    });
    test('handle leap year without starting date 0 0 29 2 *', () => {
      const interval = CronExpression.parse('0 0 29 2 *');
      for (let i = 0; i < 20; ++i) {
        expect(interval.next().getDate()).toEqual(29);
      }
    });
    test('handle leap year when day of month is set to 31', () => {
      const interval = CronExpression.parse('* * 31 * *');
      for (let i = 0; i < 20; ++i) {
        expect(interval.next().getDate()).not.toBeNull();
      }
    });
  });

  describe('prev date', () => {
    test('prev should match correctly (issue #98) when milliseconds are greater than 0', () => {
      const options = {
        currentDate: new Date('2017-06-13T18:21:25.002Z'),
      };

      const interval = CronExpression.parse('*/5 * * * * *', options);
      const prev = interval.prev();
      expect(prev.getSeconds()).toEqual(25);
    });

    test('prev should match correctly (issue #98) when milliseconds are equal to 0', () => {
      const interval = CronExpression.parse('59 59 23 * * *', {
        currentDate: new Date('2012-12-26 14:38:53'),
      });

      for (const date of [25, 24, 23, 22]) {
        const prev = interval.prev();
        expect(prev.getFullYear()).toEqual(2012);
        expect(prev.getMonth()).toEqual(11);
        expect(prev.getDate()).toEqual(date);
        expect(prev.getHours()).toEqual(23);
        expect(prev.getMinutes()).toEqual(59);
        expect(prev.getSeconds()).toEqual(59);
      }
    });
  });

  describe('timezones and DST tests', () => {
    test('It works on DST start', () => {
      const options: CronOptions = {
        currentDate: '2016-03-27 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      let interval: CronExpression;
      let next: CronDate;

      interval = CronExpression.parse('0 * * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(5); // 5 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      interval = CronExpression.parse('30 2 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getMinutes()).toEqual(30); // 30 Minutes
      expect(next.getHours()).toEqual(2); // 2 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(30); // 30 Minutes
      expect(next.getHours()).toEqual(2); // 2 AM
      expect(next.getDate()).toEqual(28); // on the 28th

      interval = CronExpression.parse('0 3 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(3); // 3 on the 28th
      expect(next.getDate()).toEqual(28); // on the 28th

      interval = CronExpression.parse('*/20 3 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(20); // 20 Minutes
      expect(next.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(40); // 20 Minutes
      expect(next.getHours()).toEqual(4); // Due to DST start in Athens, 3 is skipped
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(3); // 3 AM
      expect(next.getDate()).toEqual(28); // on the 28th

      options.currentDate = '2016-03-27 00:00:01';

      interval = CronExpression.parse('0 * 27 * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(1); // 1 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(2); // 2 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(4); // 4 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(5); // 5 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      options.currentDate = '2016-03-27 00:00:01';
      options.endDate = '2016-03-27 03:00:01';

      interval = CronExpression.parse('0 * * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(1); // 1 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(2); // 2 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      next = interval.next();
      expect(next.getMinutes()).toEqual(0); // 0 Minutes
      expect(next.getHours()).toEqual(4); // 4 AM
      expect(next.getDate()).toEqual(27); // on the 27th

      // Out of the timespan range
      expect(() => interval.next()).toThrow();
    });

    test('It works on DST end 2016-10-30 02:00:01 - 0 * * * *', () => {
      const options: CronOptions = {
        currentDate: '2016-10-30 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression  = CronExpression.parse('0 * * * *', options);
      let next: CronDate;
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(3);
      expect(next.getDate()).toEqual(30);

      next = interval.next();
      expect(next.getHours()).toEqual(3); // Due to DST end in Athens (4-->3)
      expect(next.getDate()).toEqual(30);

      next = interval.next();
      expect(next.getHours()).toEqual(4);
      expect(next.getDate()).toEqual(30);
    });

    test('works on DST end 2016-10-30 02:00:01 - 0 3 * * *', () => {
      const options: CronOptions = {
        currentDate: '2016-10-30 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression = CronExpression.parse('0 3 * * *', options);
      let next: CronDate;

      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(3);
      expect(next.getDate()).toEqual(30);

      next = interval.next();
      expect(next.getHours()).toEqual(3);
      expect(next.getDate()).toEqual(31);
    });

    test('works on DST end 2016-10-30 02:00:01 - */20 3 * * *', () => {
      const options: CronOptions = {
        currentDate: '2016-10-30 02:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression = CronExpression.parse('*/20 3 * * *', options);
      let next: CronDate;

      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getMinutes()).toEqual(0);
      expect(next.getHours()).toEqual(3);
      expect(next.getDate()).toEqual(30);

      next = interval.next();
      expect(next.getMinutes()).toEqual(20);
      expect(next.getHours()).toEqual(3);
      expect(next.getDate()).toEqual(30);

      next = interval.next();
      expect(next.getMinutes()).toEqual(40);
      expect(next.getHours()).toEqual(3);
      expect(next.getDate()).toEqual(30);

      next = interval.next();
      expect(next.getMinutes()).toEqual(0);
      expect(next.getHours()).toEqual(3);
      expect(next.getDate()).toEqual(31);
    });

    test('works on DST end 2016-10-30 00:00:01 - 0 * 30 * *', () => {
      const options: CronOptions = {
        currentDate: '2016-10-30 00:00:01',
        endDate: undefined,
        tz: 'Europe/Athens',
      };

      const interval: CronExpression = CronExpression.parse('0 * 30 * *', options);
      let next: CronDate;

      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(1); // 1 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(2); // 2 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(3); // 3 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(3); // 3 AM (DST end)
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(4); // 4 AM
      expect(next.getDate()).toEqual(30); // on the 30th
    });

    test('works on DST end 2016-10-30 00:00:01 - 0 * * * *  DST offset via ISO 8601 format', () => {
      // specify the DST offset via ISO 8601 format, as 3am is repeated
      const options: CronOptions = {
        currentDate: '2016-10-30 00:00:01',
        endDate: '2016-10-30T03:00:01+03',
        tz: 'Europe/Athens',
      };

      let interval: CronExpression = CronExpression.parse('0 * * * *', options);
      let next: CronDate;
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(1); // 1 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(2); // 2 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(3); // 3 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      // Out of the timespan range
      expect(() => interval.next()).toThrow();

      options.endDate = '2016-10-30 04:00:01';

      interval = CronExpression.parse('0 * * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(1); // 1 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(2); // 2 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(3); // 3 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(3); // 3 AM (DST end)
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(4); // 4 AM
      expect(next.getDate()).toEqual(30); // on the 30th

      // Out of the timespan range
      expect(() => interval.next()).toThrow();

      options.currentDate = new Date('Sun Oct 29 2016 01:00:00 GMT+0200');
      options.endDate = undefined;
      // options.tz = undefined;

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(29); // on the 29th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 29 2016 02:59:00 GMT+0200');


      interval = CronExpression.parse('0 12 * * *', options);
      // t.ok(interval, 'Interval parsed');
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(29); // on the 29th
  
      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 29 2016 02:59:59 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(29); // on the 29th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 01:00:00 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 01:59:00 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 01:59:59 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(31); // on the 31st

      options.currentDate = new Date('Sun Oct 30 2016 02:59:00 GMT+0200');

      interval = CronExpression.parse('0 12 * * *', options);
      expect(interval).toBeTruthy();

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(30); // on the 30th

      next = interval.next();
      expect(next.getHours()).toEqual(12); // 12 PM
      expect(next.getDate()).toEqual(31); // on the 31st
    });

    test('it will work with #131 issue case', () => {
      const options: CronOptions = {
        tz: 'America/Sao_Paulo',
        currentDate: new Date('Sun Oct 30 2018 02:59:00 GMT+0200'),
        endDate: undefined,
      };

      const interval = CronExpression.parse('0 9 1 1 *', options);
      let next = interval.next();
      expect(next.getFullYear()).toEqual(2019);
      expect(next.getDate()).toEqual(1);
      expect(next.getMonth()).toEqual(0);

      next = interval.prev();
      expect(next.getFullYear()).toEqual(2018);
      expect(next.getDate()).toEqual(1);
      expect(next.getMonth()).toEqual(0);

      next = interval.prev();
      expect(next.getFullYear()).toEqual(2017);
      expect(next.getDate()).toEqual(1);
      expect(next.getMonth()).toEqual(0);
    });

    test('works with #137 issue case', () => {
      const options: CronOptions = {
        tz: 'America/New_York',
        currentDate: new Date('10/28/2018'),
        endDate: undefined,
      };

      const interval = CronExpression.parse('0 12 * * 3', options);
      const date = interval.next();
      expect(date.getFullYear()).toEqual(2018);
      expect(date.getDate()).toEqual(31);
      expect(date.getMonth()).toEqual(9);
    });
  });
});
