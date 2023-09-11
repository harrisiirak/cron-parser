import * as fs from 'fs';
import * as path from 'path';
import {
  CronParser,
  CronExpression,
  CronFieldCollection,
  CronFields,
  ParseStringResponse,
  CronSecond,
  CronMinute,
  CronDayOfMonth,
  CronHour,
  CronDayOfWeek,
  CronMonth,
} from '../src';
import { CronDate } from '../src/CronDate';
import ErrnoException = NodeJS.ErrnoException;

describe('CronParser', () => {
  describe('parseExpression', () => {
    test('parse a valid cron expression', () => {
      const expression = '*/5 * * * *';
      const result = CronParser.parseExpression(expression);
      expect(result).toBeInstanceOf(CronExpression);
    });

    test('throw an error for an invalid cron expression', () => {
      const expression = 'invalid_expression';
      expect(() => CronParser.parseExpression(expression)).toThrow();
    });
  });

  describe('fieldsToExpression', () => {
    test('create a CronExpression from fields', () => {
      const fields = new CronFieldCollection({
        second: new CronSecond([0]),
        minute: new CronMinute([0]),
        hour: new CronHour([0]),
        dayOfMonth: new CronDayOfMonth([1]),
        month: new CronMonth([1]),
        dayOfWeek: new CronDayOfWeek([1]),
      });
      const result = CronParser.fieldsToExpression(fields);
      expect(result).toBeInstanceOf(CronExpression);
    });
  });

  describe('parseString', () => {
    test('parse a valid crontab string', () => {
      const data = `
        # This is a comment
        FOO=bar
        */5 * * * * some-command
        * * * * * another-command
        # Another comment
      `;
      const result = CronParser.parseString(data);
      expect(result.variables).toEqual({ FOO: 'bar' });
      expect(result.expressions).toHaveLength(2);
      expect(result.errors).toEqual({});
    });

    test('should include errors for invalid expressions', () => {
      const data = `
        # This is a comment
        FOO=bar
        */5 * * * * some-command
        invalid_expression another-command
      `;
      const result = CronParser.parseString(data);
      expect(result.variables).toEqual({ FOO: 'bar' });
      expect(result.expressions).toHaveLength(1);
      expect(result.errors).toHaveProperty('invalid_expression another-command');
    });
  });

  describe('parseFile', () => {
    const filePath = './test-crontab.txt';
    const crontabExamplePath = path.join(process.cwd(), 'tests/crontab.example');

    beforeAll(() => {
      const data = `
        # This is a comment
        FOO=bar
        */5 * * * * some-command
        * * * * * another-command
        * * * * *
      `;
      fs.writeFileSync(filePath, data);
    });

    afterAll(() => {
      fs.unlinkSync(filePath);
    });

    test('read and parse a valid crontab file', (done) => {
      CronParser.parseFile(filePath, (err, data) => {
        if (err) {
          done(err);
          return;
        }

        expect(data).toHaveProperty('variables', { FOO: 'bar' });
        expect(data).toHaveProperty('expressions');
        expect(data?.expressions).toHaveLength(3);
        expect(data).toHaveProperty('errors', {});
        done();
      });
    });

    test('return an error for a non-existing file', (done) => {
      CronParser.parseFile('./nonexistent.txt', (err: ErrnoException | null, data?: ParseStringResponse | undefined) => {
        if (err) {
          expect(err.code).toBe('ENOENT');
        } else {
          throw new Error('Expected an error');
        }
        expect(data).toBeUndefined();
        done();
      });
    });

    test('load crontab file', () => {
      CronParser.parseFile(crontabExamplePath, (err, result) => {
        if (err) {
          err.message = 'File read error: ' + err.message;
          throw err;
        }
        if (!(result && 'variables' in result && 'expressions' in result && 'errors' in result)) {
          throw new Error('result is not ParseStringResponse');
        }
        // t.ok(result, 'Crontab parsed parsed');
        expect(Object.keys(result.variables).length).toEqual(2); // variables length matches
        expect(Object.keys(result.errors).length).toEqual(0); // errors length matches
        expect(result.expressions.length).toEqual(3); // expressions length matches

        // Parse expressions
        let next;
        expect(result.expressions[0].hasNext()).toEqual(true);
        next = result.expressions[0].next();
        expect(next).toBeInstanceOf(CronDate); // first date

        next = result.expressions[1].next();
        expect(next).toBeInstanceOf(CronDate); // second date

        next = result.expressions[2].next();
        expect(next).toBeInstanceOf(CronDate); // third date
      });
    });

    test('no next date', () => {
      const options = {
        currentDate: new Date(2014, 0, 1),
        endDate: new Date(2014, 0, 1),
      };

      const interval = CronParser.parseExpression('* * 2 * *', options);
      expect(interval.hasNext()).toEqual(false);
    });
  });

  describe('test expressions with "L" last of flag', () => {
    const testCasesLastWeekdayOfMonth = [
      { expression: '0 0 0 * * 1L', expectedDate: 27 },
      { expression: '0 0 0 * * 2L', expectedDate: 28 },
      { expression: '0 0 0 * * 3L', expectedDate: 29 },
      { expression: '0 0 0 * * 4L', expectedDate: 30 },
      { expression: '0 0 0 * * 5L', expectedDate: 24 },
      { expression: '0 0 0 * * 6L', expectedDate: 25 },
      { expression: '0 0 0 * * 0L', expectedDate: 26 },
      { expression: '0 0 0 * * 7L', expectedDate: 26 },
    ];

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

      const items = 9;
      let next;
      let i = 0;
      while (interval.hasNext()) {
        next = interval.next();
        i += 1;
        expect(next).toBeDefined();
      }

      //leap year
      if (!next) {
        throw new Error('Invalid date');
      }
      expect(next).not.toBeUndefined();
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

      let next;
      while (interval.hasNext()) {
        next = interval.next();
        expect(next).toBeDefined();
      }
      if (!next) {
        throw new Error('Invalid date');
      }
      expect(next).not.toBeUndefined();
      expect(next.getDate()).toBe(28);
    });

    testCasesLastWeekdayOfMonth.forEach(({ expression, expectedDate }) => {
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

      expect(next.getDate()).toBe(24);
      next = interval.next();

      expect(next.getDate()).toBe(27);
    });

    test('parses expression that runs on both every monday and last friday of month', () => {
      const options = {
        currentDate: new Date(2021, 8, 1),
        endDate: new Date(2021, 8, 30),
      };
      const interval = CronParser.parseExpression('0 0 0 * * 1,5L', options);
      const dates: number[] = [];
      let isNotDone = true;
      while (isNotDone) {
        try {
          const next = interval.next();
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

  describe('stringify', () => {
    test('stringify cron expression all stars no seconds 0 * * * * *', () => {
      const expected = '0 * * * * *';
      const interval = CronParser.parseExpression('* * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected); // `expected: ${expected}, actual: ${str}`;
    });

    test('stringify cron expression all stars no seconds (discard seconds)', () => {
      const expected = '* * * * *';
      const interval = CronParser.parseExpression('* * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression all stars with seconds', () => {
      const expected = '* * * * * *';
      const interval = CronParser.parseExpression('* * * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression all stars with seconds (discard seconds)', () => {
      const expected = '* * * * *';
      const interval = CronParser.parseExpression('* * * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression', () => {
      const expected = '0 1,2,4-10,20-35/5,57 * * * *';
      const interval = CronParser.parseExpression('1,2,4-10,20-35/5,57 * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression (discard seconds)', () => {
      const expected = '1,2,4-10,20-35/5,57 * * * *';
      const interval = CronParser.parseExpression('1,2,4-10,20-35/5,57 * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with star range step', () => {
      const expected = '0 */5 */2 * * *';
      const interval = CronParser.parseExpression('*/5 */2 */1 * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with multiple values and retain original value', () => {
      const expected = '0 * * * * 1,3,5';
      const interval = CronParser.parseExpression('* * * * 1,3,5', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('correctly stringify cron expression * * * * 0,2,4 and convert value to range step', () => {
      const expected = '0 * * * * 0-4/2';
      const interval = CronParser.parseExpression('* * * * 0,2,4', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('correctly stringify cron expression * * * * 0,2,4,6 convert value to */2 step', () => {
      const expected = '0 * * * * */2';
      const interval = CronParser.parseExpression('* * * * 0,2,4,6', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('correctly stringify cron expression * * * * */2', () => {
      const expected = '0 * * * * */2';
      const interval = CronParser.parseExpression('* * * * */2', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with star range step (discard seconds)', () => {
      const expected = '*/5 */2 * * *';
      const interval = CronParser.parseExpression('*/5 */2 */1 * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with semi range step', () => {
      const expected = '0 5/5 * * * *';
      const interval = CronParser.parseExpression('5/5 * * * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with semi range step (discard seconds)', () => {
      const expected = '5/5 * * * *';
      const interval = CronParser.parseExpression('5/5 * * * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with L', () => {
      const expected = '0 * * 1,4-10,L * *';
      const interval = CronParser.parseExpression('* * 1,4-10,L * *', {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with L (discard seconds)', () => {
      const expected = '* * 1,4-10,L * *';
      const interval = CronParser.parseExpression('* * 1,4-10,L * *', {});
      let str = interval.stringify();
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with weekday L', () => {
      const expected = '0 0 0 * * 1L';
      const interval = CronParser.parseExpression(expected, {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with multiple weekday, one of them with an L', () => {
      const expected = '0 0 0 * * 4,6L';
      const interval = CronParser.parseExpression(expected, {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with multiple weekday, two of them with an L', () => {
      const expected = '0 0 0 * * 1L,5L';
      const interval = CronParser.parseExpression(expected, {});
      let str = interval.stringify(true);
      expect(str).toEqual(expected);
      str = CronParser.fieldsToExpression(interval.fields).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with wildcard day of month and single month value', () => {
      const expected = '* * * 4 *';
      const interval = CronParser.parseExpression(expected, {});
      const str = interval.stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with wildcard day of month and month range', () => {
      const expected = '* * * 4-6 *';
      const interval = CronParser.parseExpression(expected, {});
      const str = interval.stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with day of month range and single month value', () => {
      const expected = '* * 1-25 4 *';
      const interval = CronParser.parseExpression(expected, {});
      const str = interval.stringify();
      expect(str).toEqual(expected);
    });

    test('stringify from fields out of order', () => {
      const expected = '1-5 1 1 1 1 1';
      const str = CronParser.fieldsToExpression(new CronFieldCollection({
        second: new CronSecond([5, 2, 1, 4, 3]),
        minute: new CronMinute([1]),
        hour: new CronHour([1]),
        month: new CronMonth([1]),
        dayOfMonth: new CronDayOfMonth([1]),
        dayOfWeek: new CronDayOfWeek([1]),
      })).stringify(true);
      expect(str).toEqual(expected);
    });

    test('stringify from fields out of order (discard seconds)', () => {
      const expected = '1 1 1 1 1';
      const str = CronParser.fieldsToExpression(new CronFieldCollection({
        second: new CronSecond([5, 2, 1, 4, 3]),
        minute: new CronMinute([1]),
        hour: new CronHour([1]),
        month: new CronMonth([1]),
        dayOfMonth: new CronDayOfMonth([1]),
        dayOfWeek: new CronDayOfWeek([1]),
      })).stringify();
      expect(str).toEqual(expected);
    });

    test('stringify cron expression with extended day of week range (0,7)', () => {
      const expected = '* * * * *';
      const interval = CronParser.parseExpression('* * * * *');

      let str = CronParser.fieldsToExpression(new CronFieldCollection({
        second: interval.fields.second,
        minute: interval.fields.minute,
        hour: interval.fields.hour,
        month: interval.fields.month,
        dayOfMonth: interval.fields.dayOfMonth,
        dayOfWeek: new CronDayOfWeek([0, 1, 2, 3, 4, 5, 6]),
      })).stringify();
      expect(str).toEqual(expected);

      str = CronParser.fieldsToExpression(new CronFieldCollection({
        second: interval.fields.second,
        minute: interval.fields.minute,
        hour: interval.fields.hour,
        month: interval.fields.month,
        dayOfMonth: interval.fields.dayOfMonth,
        dayOfWeek: new CronDayOfWeek([0, 1, 2, 3, 4, 5, 6, 7]),
      })).stringify();
      expect(str).toEqual(expected);
    });

    test('throw validation error - missing field (seconds)', () => {
      const input = <CronFields>{
        minute: new CronMinute([1]),
        hour: new CronHour([1]),
        month: new CronMonth([1]),
        dayOfMonth: new CronDayOfMonth([1]),
        dayOfWeek: new CronDayOfWeek([1]),
      };
      expect(() => CronParser.fieldsToExpression(new CronFieldCollection(input))).toThrowError('Validation error, Field second is missing');
    });
  });
});
