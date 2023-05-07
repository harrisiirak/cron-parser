import { CronExpression } from '../src/index.js';

const options = {
  utc: true,
};

describe('CronExpression', () => {
  test('both empty around comma', () => {
    expect(() => {
      CronExpression.parse('*/10 * * * * ,', options);
    }).toThrow(new Error('Invalid list value format'));
  });

  test('one side empty around comma', () => {
    expect(() => {
      CronExpression.parse('*/10 * * * * ,2', options);
    }).toThrow(new Error('Invalid list value format'));
  });
});
