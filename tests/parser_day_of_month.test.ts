import {CronDate, CronParser} from '../src';

const testCasesLastWeekdayOfMonth = [
  {expression: '0 0 0 * * 1L', expectedDate: 27},
  {expression: '0 0 0 * * 2L', expectedDate: 28},
  {expression: '0 0 0 * * 3L', expectedDate: 29},
  {expression: '0 0 0 * * 4L', expectedDate: 30},
  {expression: '0 0 0 * * 5L', expectedDate: 24},
  {expression: '0 0 0 * * 6L', expectedDate: 25},
  {expression: '0 0 0 * * 0L', expectedDate: 26},
  {expression: '0 0 0 * * 7L', expectedDate: 26},
];

describe('CronParser', () => {
  test('parse cron with last day in a month', () => {
    const options = {
      currentDate: new Date(2014, 0, 1),
      endDate: new Date(2014, 10, 1),
    };

    const interval = CronParser.parseExpression('0 0 L * *', options);
    expect(interval.hasNext()).toBe(true);

    for (let i = 0; i < 10; ++i) {
      const next = interval.next();
      expect(next).toBeDefined();
    }
  });

  test('parse cron with last day in feb', () => {
    const options = {
      currentDate: new Date(2016, 0, 1),
      endDate: new Date(2016, 10, 1),
    };

    const interval = CronParser.parseExpression('0 0 6-20/2,L 2 *', options);
    expect(interval.hasNext()).toBe(true);
    let next = null;
    const items = 9;
    let i = 0;
    while (interval.hasNext()) {
      next = interval.next();
      i += 1;
      expect(next).toBeDefined();
    }
    if (!(next instanceof CronDate)) {
      throw new Error('next is not instance of CronDate');
    }
    //leap year
    expect(next.getDate()).toBe(29);
    expect(i).toBe(items);

  });

  test('parse cron with last day in feb', () => {
    const options = {
      currentDate: new Date(2014, 0, 1),
      endDate: new Date(2014, 10, 1),
    };

    const interval = CronParser.parseExpression('0 0 1,3,6-10,L 2 *', options);
    expect(interval.hasNext()).toBe(true);
    let next = null;
    while (interval.hasNext()) {
      next = interval.next();
      expect(next).toBeDefined();
    }
    if (!(next instanceof CronDate)) {
      throw new Error('next is not instance of CronDate');
    }
    //common year
    expect(next.getDate()).toBe(28);
  });


  testCasesLastWeekdayOfMonth.forEach(({expression, expectedDate}) => {
    const options = {
      currentDate: new Date(2021, 8, 1),
      endDate: new Date(2021, 11, 1),
    };

    test(`parse cron with last weekday of the month: ${expression}`, () => {
      const interval = CronParser.parseExpression(expression, options);

      expect(interval.hasNext()).toBe(true);

      const next = interval.next();
      if (!(next instanceof CronDate)) {
        throw new Error('next is not instance of CronDate');
      }
      expect(next.getDate()).toBe(expectedDate);
    });
  });


  test('parses expression that runs on both last monday and friday of the month', () => {
    const options = {
      currentDate: new Date(2021, 8, 1),
      endDate: new Date(2021, 11, 1),
    };
    const interval = CronParser.parseExpression('0 0 0 * * 1L,5L', options);
    let next = interval.next();
    if (!(next instanceof CronDate)) {
      throw new Error('next is not instance of CronDate');
    }
    expect(next.getDate()).toBe(24);
    next = interval.next();
    if (!(next instanceof CronDate)) {
      throw new Error('next is not instance of CronDate');
    }
    expect(next.getDate()).toBe(27);
  });

  test('parses expression that runs on both every monday and last friday of month', () => {
    const options = {
      currentDate: new Date(2021, 8, 1),
      endDate: new Date(2021, 8, 30),
    };
    const interval = CronParser.parseExpression('0 0 0 * * 1,5L', options);

    const dates = [];

    let isNotDone = true;
    while (isNotDone) {
      try {
        const next = interval.next();
        if (!(next instanceof CronDate)) {
          throw new Error('next is not instance of CronDate');
        }
        dates.push(next.getDate());
      } catch (e) {
        if (e instanceof Error && e.message !== 'Out of the timespan range') {
          throw e;
        }
        isNotDone = false;
        break;
      }
    }

    expect(dates).toEqual([6, 13, 20, 24, 27]);
  });

  test('throw new Errors to parse for invalid last weekday of month expression', () => {
    expect(() => {
      const interval = CronParser.parseExpression('0 0 0 * * L');
      interval.next();
    }).toThrow();
  });
});

