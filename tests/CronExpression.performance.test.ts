import { CronDate } from '../src/CronDate';
import CronExpressionParser from '../src';

/**
 * NOTE:
 * This is a *performance regression* test, but it is intentionally NOT time-based.
 *
 * Jest timeouts are not reliable for CPU-bound sync code (the event loop can't preempt a long `next()`),
 * and wall-clock thresholds are notoriously flaky across CI + dev machines.
 *
 * Instead we count how many date-operations the scheduler performs. This is deterministic and directly
 * measures the current inefficiency (linear scanning) that we want to optimize.
 */
describe('CronExpression performance characteristics', () => {
  test('next() for a daily 09:00 schedule should not scan through minutes/hours', () => {
    // "Once a day at 09:00"
    const interval = CronExpressionParser.parse('0 9 * * *', {
      currentDate: '2023-01-01T09:00:00Z',
    });

    let opCount = 0;
    const originalApply = CronDate.prototype.applyDateOperation;
    CronDate.prototype.applyDateOperation = function (...args: Parameters<CronDate['applyDateOperation']>) {
      opCount += 1;
      return originalApply.apply(this, args as any);
    };

    try {
      const next = interval.next();
      expect(next.toISOString()).toBe('2023-01-02T09:00:00.000Z');

      expect(opCount).toBeLessThanOrEqual(20);
    } finally {
      CronDate.prototype.applyDateOperation = originalApply;
    }
  });
});
