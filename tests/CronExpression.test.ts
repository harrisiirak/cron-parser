import { CronExpression, CronExpressionOptions } from '../src/CronExpression';
import { CronFieldCollection } from '../src/CronFieldCollection';
import { expect } from '@jest/globals';
import { CronDayOfMonth, CronDayOfWeek, CronHour, CronMinute, CronMonth, CronSecond } from '../src/fields';

describe('CronExpression', () => {
  let fields: CronFieldCollection;
  let options: CronExpressionOptions;

  beforeEach(() => {
    fields = new CronFieldCollection({
      second: new CronSecond([0]),
      minute: new CronMinute([0]),
      hour: new CronHour([0]),
      month: new CronMonth([1]),
      dayOfMonth: new CronDayOfMonth([1]),
      dayOfWeek: new CronDayOfWeek([0, 7]),
    });
    options = {
      currentDate: new Date('2023-01-01T00:00:00Z'),
    };
  });

  test('should create a new CronExpression instance', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression).toBeInstanceOf(CronExpression);
  });

  test('should return the next scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    const nextDate = cronExpression.next();
    expect(nextDate.toISOString()).toBe('2023-01-08T00:00:00.000Z');
  });

  test('should return the previous scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    const prevDate = cronExpression.prev();
    expect(prevDate.toISOString()).toBe('2022-01-30T00:00:00.000Z');
  });

  test('should check if there is a next scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression.hasNext()).toBe(true);
  });

  test('should check if there is a previous scheduled date', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression.hasPrev()).toBe(true);
  });

  test('should take a specified number of steps forward', () => {
    const cronExpression = new CronExpression(fields, options);
    const dates = cronExpression.take(3);
    expect(dates.length).toBe(3);
  });

  test('should take a specified number of steps backward', () => {
    const cronExpression = new CronExpression(fields, options);
    const dates = cronExpression.take(-3);
    expect(dates.length).toBe(3);
  });

  test('should reset the current date to a new date', () => {
    const cronExpression = new CronExpression(fields, options);
    const newDate = new Date('2023-01-01T00:00:00Z');

    let nextDate = cronExpression.next().toISOString();
    expect(nextDate).toBe('2023-01-08T00:00:00.000Z');

    cronExpression.reset(newDate);
    nextDate = cronExpression.next().toISOString();
    expect(nextDate).toBe('2023-01-08T00:00:00.000Z');
  });

  test('should generate a string representation of the cron expression', () => {
    const cronExpression = new CronExpression(fields, options);
    const cronString = cronExpression.stringify();
    expect(cronString).toBe('0 0 1 1 0');
  });

  test('should check if the cron expression includes a given date', () => {
    const cronExpression = new CronExpression(fields, options);
    const date = new Date('2023-01-01T00:00:00.000Z');
    expect(cronExpression.includesDate(date)).toBe(true);
  });

  test('should return the string representation of the cron expression', () => {
    const cronExpression = new CronExpression(fields, options);
    expect(cronExpression.toString()).toBe('0 0 0 1 1 0');
  });
});
