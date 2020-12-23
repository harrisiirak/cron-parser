var test = require('tap').test;
var CronExpression = require('../lib/expression');
var CronDate = require('../lib/date');

test('default expression test', function(t) {
    try {
      var interval = CronExpression.parse('* * * * *');
      t.ok(interval, 'Interval parsed');
  
      var date = new CronDate();
      var next = interval.next();
      t.ok(next, 'Found next scheduled interval');
  
      var format = 'DD-MM-YYYY';
      t.equal(next.format(format), date.format(format), 'Schedule matches');
  
    } catch (err) {
      t.ifError(err, 'Interval parse error');
    }
  
    t.end();
  });