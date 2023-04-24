var util = require('util');
var test = require('tap').test;
var {CronExpression} = require('../lib/CronExpression');

test('expression 31 of month', function(t) {
  try {
    var interval = CronExpression.parse('0 0 31 * *');
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
