const {CronFields} = require('../lib/CronFields');
const test = require('tap').test;


// test('CronFields constraints should be immutable', function (t) {
//     CronFields.constraints.second.min = 5;
//     CronFields.constraints.second.newValue = 5;
//     t.equal(CronFields.constraints.second.min, 0, 'seconds should be 0');
//     t.equal(CronFields.constraints.second.newValue, undefined, 'seconds.newValue should be undefined');
//
//     t.end();
// });
