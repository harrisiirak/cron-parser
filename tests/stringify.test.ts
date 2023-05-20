import { CronFieldCollection, CronParser } from '../src';
import { CronFieldCollectionOptions } from '../src/types';

describe('CronParser', () => {
  it('should stringify cron expression all stars no seconds 0 * * * * *', function () {
    const expected = '0 * * * * *';
    const interval = CronParser.parseExpression('* * * * *', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected); // `expected: ${expected}, actual: ${str}`;
  });

  it('should stringify cron expression all stars no seconds (discard seconds)', function () {

    const expected = '* * * * *';
    const interval = CronParser.parseExpression('* * * * *', {});
    let str = interval.stringify();
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression all stars with seconds', function () {
    const expected = '* * * * * *';
    const interval = CronParser.parseExpression('* * * * * *', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression all stars with seconds (discard seconds)', function () {
    const expected = '* * * * *';
    const interval = CronParser.parseExpression('* * * * * *', {});
    let str = interval.stringify();
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression', function () {
    const expected = '0 1,2,4-10,20-35/5,57 * * * *';
    const interval = CronParser.parseExpression('1,2,4-10,20-35/5,57 * * * *', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression (discard seconds)', function () {
    const expected = '1,2,4-10,20-35/5,57 * * * *';
    const interval = CronParser.parseExpression('1,2,4-10,20-35/5,57 * * * *', {});
    let str = interval.stringify();
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with star range step', function () {
    const expected = '0 */5 */2 * * *';
    const interval = CronParser.parseExpression('*/5 */2 */1 * *', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with multiple values and retain original value', function () {
    const expected = '0 * * * * 1,3,5';
    const interval = CronParser.parseExpression('* * * * 1,3,5', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should correctly stringify cron expression * * * * 0,2,4 and convert value to range step', function () {
    const expected = '0 * * * * 0-4/2';
    const interval = CronParser.parseExpression('* * * * 0,2,4', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should correctly stringify cron expression * * * * 0,2,4,6 convert value to */2 step', function () {
    const expected = '0 * * * * */2';
    const interval = CronParser.parseExpression('* * * * 0,2,4,6', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should correctly stringify cron expression * * * * */2', function () {
    const expected = '0 * * * * */2';
    const interval = CronParser.parseExpression('* * * * */2', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with star range step (discard seconds)', function () {
    const expected = '*/5 */2 * * *';
    const interval = CronParser.parseExpression('*/5 */2 */1 * *', {});
    let str = interval.stringify();
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with semi range step', function () {
    const expected = '0 5/5 * * * *';
    const interval = CronParser.parseExpression('5/5 * * * *', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with semi range step (discard seconds)', function () {
    const expected = '5/5 * * * *';
    const interval = CronParser.parseExpression('5/5 * * * *', {});
    let str = interval.stringify();
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with L', function () {
    const expected = '0 * * 1,4-10,L * *';
    const interval = CronParser.parseExpression('* * 1,4-10,L * *', {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with L (discard seconds)', function () {
    const expected = '* * 1,4-10,L * *';
    const interval = CronParser.parseExpression('* * 1,4-10,L * *', {});
    let str = interval.stringify();
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with weekday L', function () {
    const expected = '0 0 0 * * 1L';
    const interval = CronParser.parseExpression(expected, {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with multiple weekday, one of them with an L', function () {
    const expected = '0 0 0 * * 4,6L';
    const interval = CronParser.parseExpression(expected, {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with multiple weekday, two of them with an L', function () {
    const expected = '0 0 0 * * 1L,5L';
    const interval = CronParser.parseExpression(expected, {});
    let str = interval.stringify(true);
    expect(str).toEqual(expected);
    str = CronParser.fieldsToExpression(interval.fields).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with wildcard day of month and single month value', function () {
    const expected = '* * * 4 *';
    const interval = CronParser.parseExpression(expected, {});
    const str = interval.stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with wildcard day of month and month range', function () {
    const expected = '* * * 4-6 *';
    const interval = CronParser.parseExpression(expected, {});
    const str = interval.stringify();
    expect(str).toEqual(expected);
  });
  it('should stringify cron expression with day of month range and single month value', function () {
    const expected = '* * 1-25 4 *';
    const interval = CronParser.parseExpression(expected, {});
    const str = interval.stringify();
    expect(str).toEqual(expected);
  });

  // TODO: not supported yet
  // it('should stringify cron expression with on last day of month range', function () {
  //   const expected = '* * L-1 * *';
  //   const interval = CronParser.parseExpression(expected, {});
  //   const str = interval.stringify();
  //   expect(str).toEqual(expected);
  // });



  it('should stringify from fields out of order', function () {
    const expected = '1-5 1 1 1 1 1';
    const str = CronParser.fieldsToExpression(new CronFieldCollection({
      second: [5, 2, 1, 4, 3],
      minute: [1],
      hour: [1],
      month: [1],
      dayOfMonth: [1],
      dayOfWeek: [1],
    })).stringify(true);
    expect(str).toEqual(expected);
  });

  it('should stringify from fields out of order (discard seconds)', function () {
    const expected = '1 1 1 1 1';
    const str = CronParser.fieldsToExpression(new CronFieldCollection({
      second: [5, 2, 1, 4, 3],
      minute: [1],
      hour: [1],
      month: [1],
      dayOfMonth: [1],
      dayOfWeek: [1],
    })).stringify();
    expect(str).toEqual(expected);
  });

  it('should stringify cron expression with extended day of week range (0,7)', function () {
    const expected = '* * * * *';
    const interval = CronParser.parseExpression('* * * * *');

    let str = CronParser.fieldsToExpression(new CronFieldCollection({
      second: interval.fields.second,
      minute: interval.fields.minute,
      hour: interval.fields.hour,
      month: interval.fields.month,
      dayOfMonth: interval.fields.dayOfMonth,
      dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
    })).stringify();
    expect(str).toEqual(expected);

    str = CronParser.fieldsToExpression(new CronFieldCollection({
      second: interval.fields.second,
      minute: interval.fields.minute,
      hour: interval.fields.hour,
      month: interval.fields.month,
      dayOfMonth: interval.fields.dayOfMonth,
      dayOfWeek: [0, 1, 2, 3, 4, 5, 6, 7],
    })).stringify();
    expect(str).toEqual(expected);
  });

  it('should throw validation error - missing seconds', function () {
    const input = <CronFieldCollectionOptions>{
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    };
    expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('Validation error, Field second is missing');
  });

  it('should throw validation error - empty seconds', function () {
    const input = <CronFieldCollectionOptions>{
      second: [],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    };
    expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('CronSecond Validation error, values contains no values');
  });

  it('should throw validation error - missing values - empty array', function () {
    const input = <CronFieldCollectionOptions>{
      second: [1],
      minute: [],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    };
    expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('CronMinute Validation error, values contains no values');
  });

  it('should throw validation error - missing values', function () {
    const input = <CronFieldCollectionOptions>{
      second: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    };
    expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('Validation error, Field minute is missing');
  });

  it('should throw validation error - range error', function () {
    const input = <CronFieldCollectionOptions>{
      second: [-1, 1, 0],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    };
    expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('CronSecond Validation error, got value -1 expected range 0-59');
  });

  it('should throw validation error - bad chars error', function () {
    const input = <CronFieldCollectionOptions>{
      second: [0, 'R'],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    };
    expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('CronSecond Validation error, got value R expected range 0-59');
  });


  it('should throw validation error - duplicates', function () {
    const input = <CronFieldCollectionOptions>{
      second: [1, 1],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    };
    expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('CronSecond Validation error, duplicate values found: 1');
  });
});
