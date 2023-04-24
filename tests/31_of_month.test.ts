import { CronExpression, CronDate } from '../src';

describe('expression 31 of month', () => {
  test('should correctly iterate through the next 20 occurrences', () => {
    try {
      const interval = CronExpression.parse('0 0 31 * *');
      let i: number;
      let d: CronDate | { value: CronDate; done: boolean };
      let result = '';
      for (i = 0; i < 20; ++i) {
        d = interval.next();
        result = d.toString();
      }

      expect(result).toBe('Fri Jan 30 2026 19:00:00 GMT-0500 (Eastern Standard Time)');
    } catch (err: any) {
      fail(`Interval parse error: ${err.message}`);
    }
  });
});
