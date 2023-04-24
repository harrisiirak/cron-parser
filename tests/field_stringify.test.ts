import { CronFields } from '../src';

describe('CronFields', () => {
  test('stringify asterisk', () => {
    const str = CronFields.stringifyField([1, 2, 3, 4], 1, 4);
    expect(str).toEqual('*');
  });

  test('stringify asterisk step', () => {
    const str = CronFields.stringifyField([0, 2, 4, 6], 0, 7);
    expect(str).toEqual('*/2');
  });

  test('stringify single value', () => {
    const str = CronFields.stringifyField([2], 0, 7);
    expect(str).toEqual('2');
  });

  test('stringify multiple single values', () => {
    const str = CronFields.stringifyField([2, 5, 9], 0, 9);
    expect(str).toEqual('2,5,9');
  });

  test('stringify multiple ranged values', () => {
    const str = CronFields.stringifyField([1, 3, 5, 6], 0, 9);
    expect(str).toEqual('1,3,5,6');
  });

  test('stringify range', () => {
    const str = CronFields.stringifyField([2, 3, 4], 0, 7);
    expect(str).toEqual('2-4');
  });

  test('stringify range step', () => {
    const str = CronFields.stringifyField([2, 4, 6], 0, 8);
    expect(str).toEqual('2-6/2');
  });

  test('stringify semi range step', () => {
    const str = CronFields.stringifyField([4, 6, 8], 0, 9);
    expect(str).toEqual('4/2');
  });

  test('stringify multi types', () => {
    const str = CronFields.stringifyField([1, 2, 4, 5, 6, 7, 8, 9, 10, 20, 25, 30, 35, 57], 0, 59);
    expect(str).toEqual('1,2,4-10,20-35/5,57');
  });
});
