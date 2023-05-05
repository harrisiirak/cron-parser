import { CronExpression, CronDate } from '../src';

describe('parse expression as UTC', () => {
  test('UTC parse test', () => {
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
