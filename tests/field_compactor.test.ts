import { CronFields } from '../src';


describe('CronFields.compactField', () => {
  test('compact field - empty array', () => {
    const result = CronFields.compactField([]);
    expect(result).toEqual([]);
  });

  test('compact field - single element array', () => {
    const result = CronFields.compactField([1]);
    expect(result).toEqual([{ start: 1, count: 1 }]);
  });

  test('compact field - 2 elements array', function () {
    const result = CronFields.compactField([1, 2]);
    expect(result).toEqual([{ start: 1, count: 1 }, { start: 2, count: 1 }]);
  });

  test('compact field - 2 elements array big step', function () {
    const result = CronFields.compactField([1, 5]);
    expect(result).toEqual([{ start: 1, count: 1 }, { start: 5, count: 1 }]);
  });


  test('compact field - 3 elements array 1 step', function () {
    const result = CronFields.compactField([1, 2, 3]);
    expect(result).toEqual([{ start: 1, end: 3, count: 3, step: 1 }]);
  });


  test('compact field - 3 elements array 1 step, dangling extra at end', function () {
    const result = CronFields.compactField([1, 2, 3, 5]);
    expect(result).toEqual([{ start: 1, end: 3, count: 3, step: 1 }, { start: 5, count: 1 }]);
  });


  test('compact field - 3 elements array 1 step, dangling extra at end and beginning', function () {
    const result = CronFields.compactField([1, 4, 5, 6, 9]);
    expect(result).toEqual([
      { start: 1, count: 1 },
      { start: 4, end: 6, count: 3, step: 1 },
      { start: 9, count: 1 },
    ]);
  });


  test('compact field - 2 ranges with dangling in the middle', function () {

    const result = CronFields.compactField([1, 2, 3, 6, 9, 11, 13]);
    expect(result).toEqual([
      { start: 1, end: 3, count: 3, step: 1 },
      { start: 6, count: 1 },
      { start: 9, end: 13, count: 3, step: 2 },
    ]);

  });

  test('compact field - with chars', function () {

    const result = CronFields.compactField(['L', 'W']);
    expect(result).toEqual([
      { start: 'L', count: 1 },
      { start: 'W', count: 1 },
    ]);

  });

  test('compact field - with chars and range', function () {

    const result = CronFields.compactField([1, 'L', 'W']);
    expect(result).toEqual([
      { start: 1, count: 1 },
      { start: 'L', count: 1 },
      { start: 'W', count: 1 },
    ]);

  });

  test('compact field - with chars and range (v2)', function () {
    const result = CronFields.compactField([1, 2, 'L', 'W']);
    expect(result).toEqual([
      { start: 1, count: 1 },
      { start: 2, count: 1 },
      { start: 'L', count: 1 },
      { start: 'W', count: 1 },
    ]);
  });

  test('compact field - with chars and range (v3)', () => {
    const result = CronFields.compactField([1, 2, 3, 'L', 'W']);
    expect(result).toEqual([
      { start: 1, end: 3, count: 3, step: 1 },
      { start: 'L', count: 1 },
      { start: 'W', count: 1 },
    ]);
  });
});




