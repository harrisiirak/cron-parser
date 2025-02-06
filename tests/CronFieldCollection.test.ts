import { CronFieldCollection } from '../src/CronFieldCollection';
import { CronSecond, CronMinute, CronHour, CronDayOfMonth, CronMonth, CronDayOfWeek } from '../src/fields';

describe('CronFieldCollection', () => {
  describe('from', () => {
    let base: CronFieldCollection;

    beforeEach(() => {
      base = new CronFieldCollection({
        second: new CronSecond([0]),
        minute: new CronMinute([0]),
        hour: new CronHour([12]),
        dayOfMonth: new CronDayOfMonth([1]),
        month: new CronMonth([1]),
        dayOfWeek: new CronDayOfWeek([1]),
      });
    });

    test('should return same fields when no overrides provided', () => {
      const result = CronFieldCollection.from(base, {});

      expect(result.second).toBe(base.second);
      expect(result.minute).toBe(base.minute);
      expect(result.hour).toBe(base.hour);
      expect(result.dayOfMonth).toBe(base.dayOfMonth);
      expect(result.month).toBe(base.month);
      expect(result.dayOfWeek).toBe(base.dayOfWeek);
    });

    test('should use provided CronField instances', () => {
      const newHour = new CronHour([15]);
      const newMinute = new CronMinute([30]);

      const result = CronFieldCollection.from(base, {
        hour: newHour,
        minute: newMinute,
      });

      expect(result.hour).toBe(newHour);
      expect(result.minute).toBe(newMinute);
      expect(result.second).toBe(base.second);
    });

    test('should create new fields from raw values', () => {
      const result = CronFieldCollection.from(base, {
        hour: [15],
        minute: [30],
      });

      expect(result.hour).not.toBe(base.hour);
      expect(result.hour.values).toEqual([15]);
      expect(result.minute).not.toBe(base.minute);
      expect(result.minute.values).toEqual([30]);
    });

    test('should handle mix of CronField instances and raw values', () => {
      const newHour = new CronHour([15]);

      const result = CronFieldCollection.from(base, {
        hour: newHour,
        minute: [30],
      });

      expect(result.hour).toBe(newHour);
      expect(result.minute).not.toBe(base.minute);
      expect(result.minute.values).toEqual([30]);
    });

    test('should handle multiple values in raw array', () => {
      const result = CronFieldCollection.from(base, {
        hour: [12, 15, 18],
        minute: [0, 15, 30, 45],
      });

      expect(result.hour).not.toBe(base.hour);
      expect(result.hour.values).toEqual([12, 15, 18]);
      expect(result.minute).not.toBe(base.minute);
      expect(result.minute.values).toEqual([0, 15, 30, 45]);
    });
  });
});
