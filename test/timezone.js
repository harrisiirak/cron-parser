var test = require('tap').test;
var CronExpression = require('../lib/expression');

test('It works on DST start', function(t) {
  try {
    var options = {
      currentDate: '2016-03-27 02:00:01',
      tz: 'Europe/Athens'
    };

    var interval = CronExpression.parse('0 * * * *', options);
    t.ok(interval, 'Interval parsed');

    var date = interval.next();
    t.equal(date.getHours(), 4, 'Due to DST start in Athens, 3 is skipped');
  } catch (err) {
    t.ifError(err, 'Interval parse error');
  }

  t.end();
});

test('It works on DST end', function(t) {
  try {
    var options = {
      currentDate: '2016-10-30 02:00:01',
      tz: 'Europe/Athens'
    };

    var interval = CronExpression.parse('0 * * * *', options);
    t.ok(interval, 'Interval parsed');

    var date = interval.next();
    t.equal(date.getHours(), 3, '3 AM');
    date = interval.next();
    t.equal(date.getHours(), 3, 'Due to DST end in Athens (4-->3)');
    date = interval.next();
    t.equal(date.getHours(), 4, '4 AM');
  } catch (err) {
    t.ifError(err, 'Interval parse error');
  }

  t.end();
});
