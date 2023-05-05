import { CronDate, CronExpression } from '../src';


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
