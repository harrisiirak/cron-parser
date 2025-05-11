import { CronDayOfWeek, CronSecond, SixtyRange } from '../src';

describe('CronField', () => {
  describe('wildcard detection', () => {
    test('should detect wildcard based on input values', () => {
      const secondField = new CronSecond([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(secondField.isWildcard).toBeFalsy();

      const dayOfWeekField = new CronDayOfWeek([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(dayOfWeekField.isWildcard).toBeTruthy();
    });

    test('should detect wildcard based options override', () => {
      const dayOfWeekField = new CronDayOfWeek([0, 1, 2, 3, 4, 5, 6], { rawValue: '', wildcard: true });
      expect(dayOfWeekField.isWildcard).toBeTruthy();
    });
  });

  describe('validate', () => {
    test('should throw error when values is not an array', () => {
      expect(() => new CronSecond(0 as any)).toThrow('CronSecond Validation error, values is not an array');
    });

    test('should throw error when values contains no values', () => {
      expect(() => new CronSecond([])).toThrow('CronSecond Validation error, values contains no values');
    });

    test('should throw an error when input value is out of the defined range', () => {
      expect(() => new CronSecond([0, 100] as SixtyRange[])).toThrow(
        'CronSecond Validation error, got value 100 expected range 0-59',
      );
    });

    test('should throw an error when duplicate value is provided as a range', () => {
      expect(() => new CronSecond([0, 59, 59])).toThrow('CronSecond Validation error, duplicate values found: 59');
    });
  });
});
