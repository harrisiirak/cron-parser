import * as fs from 'fs';
import * as path from 'path';
import { CronParser, CronExpression, CronFieldCollection, CronFieldCollectionOptions, ParseStringResponse } from '../src';
import { CronDate } from '../src/CronDate';
import ErrnoException = NodeJS.ErrnoException;

describe('CronParser', () => {
  describe('parseExpression', () => {
    it('should parse a valid cron expression', () => {
      const expression = '*/5 * * * *';
      const result = CronParser.parseExpression(expression);
      expect(result).toBeInstanceOf(CronExpression);
    });

    it('should throw an error for an invalid cron expression', () => {
      const expression = 'invalid_expression';
      expect(() => CronParser.parseExpression(expression)).toThrow();
    });
  });

  describe('fieldsToExpression', () => {
    it('should create a CronExpression from fields', () => {
      const fields = new CronFieldCollection({
        second: [0],
        minute: [0],
        hour: [0],
        dayOfMonth: [1],
        month: [1],
        dayOfWeek: [1],
      });
      const result = CronParser.fieldsToExpression(fields);
      expect(result).toBeInstanceOf(CronExpression);
    });
  });

  describe('parseString', () => {
    it('should parse a valid crontab string', () => {
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

    it('should include errors for invalid expressions', () => {
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

    it('should read and parse a valid crontab file', (done) => {
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

    it('should return an error for a non-existing file', (done) => {
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

    test('load crontab file', function () {

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

    test('no next date', function () {
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
      let next = null;
      const items = 9;
      let i = 0;
      while (interval.hasNext()) {
        next = interval.next();
        i += 1;
        expect(next).toBeDefined();
      }
      if (!(next instanceof CronDate)) {
        throw new Error('next is not instance of CronDate');
      }
      //leap year
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
      let next = null;
      while (interval.hasNext()) {
        next = interval.next();
        expect(next).toBeDefined();
      }
      if (!(next instanceof CronDate)) {
        throw new Error('next is not instance of CronDate');
      }
      //common year
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
      if (!(next instanceof CronDate)) {
        throw new Error('next is not instance of CronDate');
      }
      expect(next.getDate()).toBe(24);
      next = interval.next();
      if (!(next instanceof CronDate)) {
        throw new Error('next is not instance of CronDate');
      }
      expect(next.getDate()).toBe(27);
    });

    test('parses expression that runs on both every monday and last friday of month', () => {
      const options = {
        currentDate: new Date(2021, 8, 1),
        endDate: new Date(2021, 8, 30),
      };
      const interval = CronParser.parseExpression('0 0 0 * * 1,5L', options);

      const dates = [];

      let isNotDone = true;
      while (isNotDone) {
        try {
          const next = interval.next();
          if (!(next instanceof CronDate)) {
            throw new Error('next is not instance of CronDate');
          }
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
});
