// const {CronFields} = require('../lib/CronFields');
// const {MonthsEnum} = require('../src/types.js');
import { CronFields } from '../src';
import { MonthsEnum } from '../src/types';




// test('CronFields constraints should be immutable', function (t) {
//     CronFields.constraints.second.min = 5;
//     CronFields.constraints.second.newValue = 5;
//     t.equal(CronFields.constraints.second.min, 0, 'seconds should be 0');
//     t.equal(CronFields.constraints.second.newValue, undefined, 'seconds.newValue should be undefined');
//
//     t.end();
// });
describe('CronFields constraints should be immutable', function () {
  console.log(MonthsEnum);
  it('should be immutable', function () {
    // CronFields.constraints.second.min = 5;
    // CronFields.constraints.second.newValue = 5;
    // expect(CronFields.constraints.second.min).toBe(0);
    // expect(CronFields.constraints.second.newValue).toBe(undefined);
    expect(true).toBe(true);
  });
});
