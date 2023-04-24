var util = require('util');
var test = require('tap').test;
var {CronExpression} = require('../lib/CronExpression');

test('leap year', function(t) {
  try {
    var interval = CronExpression.parse('0 0 29 2 *');
    var i;
    var d;
    for (i = 0; i < 20; ++i) {
      d = interval.next();
    }
    t.end();
  } catch (err) {
    t.error(err, 'Interval parse error');
  }
});
