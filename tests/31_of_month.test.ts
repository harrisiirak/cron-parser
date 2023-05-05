import { CronDate, CronExpression } from '../src';

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
