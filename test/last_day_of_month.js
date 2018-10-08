var test = require('tap').test;
var expression = require('../lib/expression');

test('expression last day of month', function(t) {
  try {
    var interval = expression.parse('0 0 1 L * *');
    var i;
    var d;
    for (i = 0; i < 20; ++i) {
      d = interval.next();
    }
    t.end();
  } catch (err) {
    t.ifError(err, 'Interval parse error');
  }
});
