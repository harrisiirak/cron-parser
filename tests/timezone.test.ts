import { CronDate, CronExpression } from '../src';

type Options = {currentDate: string | Date, endDate?: string | undefined, tz?: string | undefined};

describe('CronExpression', () => {
  test('It works on DST start', () => {
    const options: Options = {
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
    const options: Options = {
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
    const options: Options = {
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
    const options: Options = {
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
    const options: Options = {
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
    const options: Options = {
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
    const options: Options = {
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
    const options: Options = {
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





