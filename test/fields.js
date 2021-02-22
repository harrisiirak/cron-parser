var test = require('tap').test;
var CronExpression = require('../lib/expression');

test('Fields are exposed', function(t){
  try {
    var interval = CronExpression.parse('0 1 2 3 * 1-3,5');
    t.ok(interval, 'Interval parsed');

    CronExpression.map.forEach(function(field) {
      interval.fields[field] = [];
      t.throws(function() {
        interval.fields[field].push(-1);
      }, /Cannot add property .*?, object is not extensible/, field + ' is frozen');
      delete interval.fields[field];
    });
    interval.fields.dummy = [];
    t.same(interval.fields.dummy, undefined, 'Fields is frozen');

    t.deepEqual(interval.fields.second, [0], 'Second matches');
    t.deepEqual(interval.fields.minute, [1], 'Minute matches');
    t.deepEqual(interval.fields.hour, [2], 'Hour matches');
    t.deepEqual(interval.fields.dayOfMonth, [3], 'Day of month matches');
    t.deepEqual(interval.fields.month, [1,2,3,4,5,6,7,8,9,10,11,12], 'Month matches');
    t.deepEqual(interval.fields.dayOfWeek, [1,2,3,5], 'Day of week matches');

  } catch (err) {
    t.ifError(err, 'Interval parse error');
  }

  t.end();
});

