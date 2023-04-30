import * as fs from 'fs';
import { CronExpression, CronFields } from '../src';
import { CronParser } from '../src';
import ErrnoException = NodeJS.ErrnoException;
import {ParseStringResponse} from '../src/types';

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
      const fields = new CronFields({
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
  });
});
