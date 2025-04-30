import { seededRandom } from '../src/utils/random';

describe('seededRandom', () => {
  test('should return a random value each call when no seed is provided', () => {
    const rand = seededRandom();

    const first = rand();
    expect(first).toEqual(expect.any(Number));

    const second = rand();
    expect(second).toEqual(expect.any(Number));
    expect(second).not.toBe(first);

    const rand2 = seededRandom();

    const third = rand2();
    expect(third).toEqual(expect.any(Number));
    expect(third).not.toBe(first);

    const fourth = rand2();
    expect(fourth).toEqual(expect.any(Number));
    expect(fourth).not.toBe(third);
    expect(fourth).not.toBe(second);
  });

  test('should return the same value each ordered call when a seed is provided', () => {
    const rand = seededRandom('F00D');

    expect(Math.floor(rand() * 100_000)).toBe(8440);
    expect(Math.floor(rand() * 100_000)).toBe(57228);
    expect(Math.floor(rand() * 100_000)).toBe(66401);
    expect(Math.floor(rand() * 100_000)).toBe(60998);
  });
});
