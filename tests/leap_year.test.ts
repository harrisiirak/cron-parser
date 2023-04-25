import {CronDate, CronExpression} from '../src';


describe('CronExpression', () => {
  const cronDateTypedTest = (date: unknown, testFn: (date: CronDate) => void): void => {
    if (!(date instanceof CronDate)) {
      fail('date is not instance of CronDate');
      return;
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
