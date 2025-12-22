import { describe, expect, test } from '@jest/globals';
import { getNextValue } from '../src/utils/getNextValue';

describe('getNextValue', () => {
  test('returns the next greater value when reverse=false', () => {
    expect(getNextValue([1, 2, 3], 1, false)).toBe(2);
    expect(getNextValue([1, 2, 3], 2, false)).toBe(3);
  });

  test('returns null when there is no next greater value (reverse=false)', () => {
    expect(getNextValue([1, 2, 3], 3, false)).toBeNull();
    expect(getNextValue([], 3, false)).toBeNull();
  });

  test('returns the previous smaller value when reverse=true', () => {
    expect(getNextValue([1, 2, 3], 3, true)).toBe(2);
    expect(getNextValue([1, 2, 3], 2, true)).toBe(1);
  });

  test('returns null when there is no previous smaller value (reverse=true)', () => {
    expect(getNextValue([1, 2, 3], 1, true)).toBeNull();
    expect(getNextValue([], 1, true)).toBeNull();
  });
});
