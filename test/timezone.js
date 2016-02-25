var test = require('tap').test;
var CronExpression = require('../lib/expression');

test('It works on DST start', function(t) {
  try {
    var options = {
      currentDate: '2016-03-27 02:00:01',
      tz: 'Europe/Athens'
    };

    var interval, date;

    interval = CronExpression.parse('0 * * * *', options);
    t.ok(interval, 'Interval parsed');

    date = interval.next();
    t.equal(date.getMinutes(), 0, '0 Minutes');
    t.equal(date.getHours(), 4, 'Due to DST start in Athens, 3 is skipped');
    t.equal(date.getDate(), 27, 'on the 27th');
  
    date = interval.next();
    t.equal(date.getMinutes(), 0, '0 Minutes');
    t.equal(date.getHours(), 5, '5 AM');
    t.equal(date.getDate(), 27, 'on the 27th');

    interval = CronExpression.parse('0 3 * * *', options);
    t.ok(interval, 'Interval parsed');

    date = interval.next();
    t.equal(date.getMinutes(), 0, '0 Minutes');
    t.equal(date.getHours(), 4, 'Due to DST start in Athens, 3 is skipped');
    t.equal(date.getDate(), 27, 'on the 27th');

    date = interval.next();
    t.equal(date.getMinutes(), 0, '0 Minutes');
    t.equal(date.getHours(), 3, '3 on the 28th');
    t.equal(date.getDate(), 28, 'on the 28th');

    interval = CronExpression.parse('*/20 3 * * *', options);
    t.ok(interval, 'Interval parsed');

    date = interval.next();
    t.equal(date.getMinutes(), 0, '0 Minutes');
    t.equal(date.getHours(), 4, 'Due to DST start in Athens, 3 is skipped');
    t.equal(date.getDate(), 27, 'on the 27th');

    date = interval.next();
    t.equal(date.getMinutes(), 20, '20 Minutes');
    t.equal(date.getHours(), 4, 'Due to DST start in Athens, 3 is skipped');
    t.equal(date.getDate(), 27, 'on the 27th');

    date = interval.next();
    t.equal(date.getMinutes(), 40, '20 Minutes');
    t.equal(date.getHours(), 4, 'Due to DST start in Athens, 3 is skipped');
    t.equal(date.getDate(), 27, 'on the 27th');

    date = interval.next();
    t.equal(date.getMinutes(), 0, '0 Minutes');
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 28, 'on the 27th');
    

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

    var interval, date;

    interval = CronExpression.parse('0 * * * *', options);
    t.ok(interval, 'Interval parsed');

    date = interval.next();
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 30, '30th');

    date = interval.next();
    t.equal(date.getHours(), 3, 'Due to DST end in Athens (4-->3)');
    t.equal(date.getDate(), 30, '30th');

    date = interval.next();
    t.equal(date.getHours(), 4, '4 AM');
    t.equal(date.getDate(), 30, '30th');

    interval = CronExpression.parse('0 3 * * *', options);
    t.ok(interval, 'Interval parsed');

    date = interval.next();
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 30, '30th');

    date = interval.next();
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 31, '31st');

    interval = CronExpression.parse('*/20 3 * * *', options);
    t.ok(interval, 'Interval parsed');

    date = interval.next();
    t.equal(date.getMinutes(), 0, '0');
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 30, '30th');

    date = interval.next();
    t.equal(date.getMinutes(), 20, '20');
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 30, '30th');

    date = interval.next();
    t.equal(date.getMinutes(), 40, '40');
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 30, '30th');

    date = interval.next();
    t.equal(date.getMinutes(), 0, '0');
    t.equal(date.getHours(), 3, '3 AM');
    t.equal(date.getDate(), 31, '31st');
    
   } catch (err) {
    t.ifError(err, 'Interval parse error');
  }

  t.end();
});
