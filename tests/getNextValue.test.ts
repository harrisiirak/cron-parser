import { describe, expect, test } from '@jest/globals';
import { CronField } from '../src/fields/CronField';
import type { CronChars, CronMax, CronMin } from '../src/fields/types';

describe('CronField.findNearestValueInList', () => {
  test('defaults reverse=false', () => {
    expect(CronField.findNearestValueInList([1, 2, 3], 1)).toBe(2);
  });

  test('returns the next greater value when reverse=false', () => {
    expect(CronField.findNearestValueInList([1, 2, 3], 1, false)).toBe(2);
    expect(CronField.findNearestValueInList([1, 2, 3], 2, false)).toBe(3);
  });

  test('returns null when there is no next greater value (reverse=false)', () => {
    expect(CronField.findNearestValueInList([1, 2, 3], 3, false)).toBeNull();
    expect(CronField.findNearestValueInList([], 3, false)).toBeNull();
  });

  test('returns the previous smaller value when reverse=true', () => {
    expect(CronField.findNearestValueInList([1, 2, 3], 3, true)).toBe(2);
    expect(CronField.findNearestValueInList([1, 2, 3], 2, true)).toBe(1);
  });

  test('returns null when there is no previous smaller value (reverse=true)', () => {
    expect(CronField.findNearestValueInList([1, 2, 3], 1, true)).toBeNull();
    expect(CronField.findNearestValueInList([], 1, true)).toBeNull();
  });
});

describe('CronField#findNearestValue', () => {
  class TestNumberField extends CronField {
    static get min(): CronMin {
      return 0;
    }

    static get max(): CronMax {
      return 59;
    }

    static get chars(): readonly CronChars[] {
      return Object.freeze([] as CronChars[]);
    }

    constructor(values: number[]) {
      super(values, { rawValue: '' });
    }
  }

  test('uses the instance values and defaults reverse=false', () => {
    const field = new TestNumberField([3, 1, 2]);
    expect(field.findNearestValue(1)).toBe(2);
  });

  test('supports reverse=true', () => {
    const field = new TestNumberField([1, 2, 3]);
    expect(field.findNearestValue(3, true)).toBe(2);
  });
});
