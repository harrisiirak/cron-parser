import { CronExpression, PredefinedExpressions } from '../src/index';
import { CronExpressionParser } from '../src/CronExpressionParser';

describe('CronExpressionParser', () => {
  describe('parse', () => {
    test('parse a expression correctly', () => {
      const expression = '* * * * *';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression).toBeInstanceOf(CronExpression);
    });

    test('parse predefined expressions correctly', () => {
      Object.entries(PredefinedExpressions).forEach(([key, value]) => {
        const cronExpression = CronExpressionParser.parse(key);
        expect(cronExpression.stringify(true)).toBe(value);
      });
    });

    test('throw an error when using both dayOfMonth and dayOfWeek together in strict mode', () => {
      const expression = '0 0 * * 1-5';
      expect(() => CronExpressionParser.parse(expression, { strict: true })).toThrow();
    });

    test('parse expressions with aliases correctly', () => {
      const expression = '0 0 1 JAN SUN';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('0 0 1 1 0');
    });

    test('throw an error when an invalid character is encountered', () => {
      const expression = '0 0 1 JAN SUNDAY';
      expect(() => CronExpressionParser.parse(expression)).toThrow();
    });

    test('parse expressions with L correctly', () => {
      const expression = '0 0 L * *';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('0 0 L * *');
    });

    test('throw an error when an invalid range is encountered', () => {
      const expression = '0 0 32 * *';
      expect(() => CronExpressionParser.parse(expression)).toThrow();
    });
  });

  describe('stringify and debug', () => {
    test('return the correct string representation and debug object', () => {
      const expression = '0 0 1,15 * 1';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('0 0 1,15 * 1');
    });

    test('handle complex expressions correctly', () => {
      const expression = '*/15 10-20,22 1-7,15,31 1,3,5,7-11 1-5';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('*/15 10-20,22 1-7,15,31 1,3,5,7,8-11 1-5');
    });

    test('throw an error when an invalid character is encountered in a specific field', () => {
      expect(() => CronExpressionParser.parse('65 * * * *')).toThrow();
      expect(() => CronExpressionParser.parse('* 70 * * *')).toThrow();
      expect(() => CronExpressionParser.parse('* * 32 * *')).toThrow();
      expect(() => CronExpressionParser.parse('* * * 14 *')).toThrow();
      expect(() => CronExpressionParser.parse('* * * * 8')).toThrow();
    });
  });
});

