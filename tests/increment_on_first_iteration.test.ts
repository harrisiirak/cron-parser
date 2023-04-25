import {CronDate, CronExpression} from '../src';

describe('CronExpression', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('increment_on_first_iteration', () => {
    try {
      const fakeNow = new Date('Tue Feb 21 2017 16:45:00');
      jest.setSystemTime(fakeNow.getTime());
      const interval = CronExpression.parse('* * * * *');
      expect(interval).toBeDefined();

      const next = interval.next();
      expect(next).toBeDefined();

      if (!(next instanceof CronDate)) {
        fail('next is not instance of CronDate');
      }
      // Make sure next has incremented in 1 minute
      expect(fakeNow.getTime() + 60000).toEqual(next.getTime());
    } catch (err) {
      if (err instanceof Error) {
        throw new Error('Interval parse error: ' + err.message);
      }
      throw err;
    }
  });
});
