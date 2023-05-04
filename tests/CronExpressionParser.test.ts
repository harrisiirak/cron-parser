import {CronExpression} from '../src';
import {CronExpressionParser} from '../src/CronExpressionParser';

const {predefined} = CronExpressionParser;

describe('CronExpressionParser', () => {
  describe('parse', () => {
    it('should parse the expression correctly', () => {
      const expression = '* * * * *';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression).toBeInstanceOf(CronExpression);
    });

    it('should parse predefined expressions correctly', () => {
      Object.entries(CronExpressionParser.predefined).forEach(([key, value]) => {
        const cronExpression = CronExpressionParser.parse(key);
        expect(cronExpression.stringify(true)).toBe(value);
      });
    });

    it('should throw an error when using both dayOfMonth and dayOfWeek together in strict mode', () => {
      const expression = '0 0 * * 1-5';
      expect(() => CronExpressionParser.parse(expression, {strict: true})).toThrow();
    });

    it('should parse expressions with aliases correctly', () => {
      const expression = '0 0 1 JAN SUN';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('0 0 1 1 0');
    });

    it('should throw an error when an invalid character is encountered', () => {
      const expression = '0 0 1 JAN SUNDAY';
      expect(() => CronExpressionParser.parse(expression)).toThrow();
    });

    // TODO: not supported yet
    // it('should parse expressions with W correctly', () => {
    //   const expression = '0 0 2W 2 2';
    //   const cronExpression = CronExpressionParser.parse(expression);
    //   expect(cronExpression.stringify()).toBe('0 0 28-29W 2 2#3');
    // });

    it('should parse expressions with # correctly', () => {
      const expression = '0 0 2 2 2#3';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('0 0 2 2 2#3');
    });

    it('should parse expressions with L correctly', () => {
      const expression = '0 0 L * *';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('0 0 L * *');
    });

    it('should throw an error when an invalid range is encountered', () => {
      const expression = '0 0 32 * *';
      expect(() => CronExpressionParser.parse(expression)).toThrow();
    });

    it('should throw an error when an invalid repeat is encountered', () => {
      const expression = '0 0 * * */8';
      expect(() => CronExpressionParser.parse(expression)).toThrow();
    });
  });

  describe('stringify and debug', () => {
    it('should return the correct string representation and debug object', () => {
      const expression = '0 0 1,15 * 1';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('0 0 1,15 * 1');
    });
    it('should handle complex expressions correctly', () => {
      const expression = '*/15 10-20,22 1-7,15,31 1,3,5,7-11 1-5';
      const cronExpression = CronExpressionParser.parse(expression);
      expect(cronExpression.stringify()).toBe('*/15 10-20,22 1-7,15,31 1,3,5,7,8-11 1-5');
    });

    it('should throw an error when an invalid character is encountered in a specific field', () => {
      expect(() => CronExpressionParser.parse('65 * * * *')).toThrow();
      expect(() => CronExpressionParser.parse('* 70 * * *')).toThrow();
      expect(() => CronExpressionParser.parse('* * 32 * *')).toThrow();
      expect(() => CronExpressionParser.parse('* * * 14 *')).toThrow();
      expect(() => CronExpressionParser.parse('* * * * 8')).toThrow();
    });
  });

  describe('predefined expressions', () => {
    it('should return the correct predefined expressions', () => {
      expect(CronExpressionParser.predefined).toEqual(predefined);
    });
  });

  describe('constructor', () => {
    it('should throw an error when attempting to instantiate', () => {
      expect(() => new CronExpressionParser()).toThrow('This class is not meant to be instantiated.');
    });
  });
});

