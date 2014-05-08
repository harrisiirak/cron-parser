var util = require('util');
var test = require('tap').test;
var CronExpression = require('../lib/expression');

test('empty expression test', function(t) {
  CronExpression.parse('', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var date = new Date();
    date.addMinute();

    var next = interval.next();

    t.ok(next, 'Found next scheduled interval');
    t.equal(next.getMinutes(), date.getMinutes(), 'Schedule matches');

    t.end();
  });
});

test('default expression test', function(t) {
  CronExpression.parse('* * * * *', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var date = new Date();
    date.addMinute();

    var next = interval.next();

    t.ok(next, 'Found next scheduled interval');
    t.equal(next.getMinutes(), date.getMinutes(), 'Schedule matches');

    t.end();
  });
});

test('default expression test (sync)', function(t) {
  var interval = CronExpression.parseSync('* * * * *');
  t.ok(interval, 'Interval parsed');

  var date = new Date();
  date.addMinute();

  var next = interval.next();

  t.ok(next, 'Found next scheduled interval');
  t.equal(next.getMinutes(), date.getMinutes(), 'Schedule matches');

  t.end();
});

test('second value out of the range', function(t) {
  CronExpression.parse('61 * * * * *', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'No interval iterator expected');

    t.end();
  });
});

test('second value out of the range', function(t) {
  CronExpression.parse('-1 * * * * *', function(err, interval) {
    console.log('Error', err);
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'No interval iterator expected');

    t.end();
  });
});

test('minute value out of the range', function(t) {
  CronExpression.parse('* 32,72 * * * *', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'No interval iterator expected');

    t.end();
  });
});

test('hour value out of the range', function(t) {
  CronExpression.parse('* * 12-36 * * *', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'No interval iterator expected');

    t.end();
  });
});

test('day of the month value out of the range', function(t) {
  CronExpression.parse('* * * 10-15,40 * *', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'No interval iterator expected');

    t.end();
  });
});

test('month value out of the range', function(t) {
  CronExpression.parse('* * * * */10,12-13 *', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'No interval iterator expected');

    t.end();
  });
});

test('day of the week value out of the range', function(t) {
  CronExpression.parse('* * * * * 9', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'No interval iterator expected');

    t.end();
  });
});

test('incremental minutes expression test', function(t) {
  CronExpression.parse('*/3 * * * *', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var next = interval.next();

    t.ok(next, 'Found next scheduled interval');
    t.equal(next.getMinutes() % 3, 0, 'Schedule matches');

    t.end();
  });
});

test('fixed expression test', function(t) {
  CronExpression.parse('10 2 12 8 0', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var next = interval.next();

    t.ok(next, 'Found next scheduled interval');
    t.equal(next.getDay(), 0, 'Day matches');
    t.equal(next.getMonth(), 7, 'Month matches');
    t.equal(next.getDate(), 12, 'Day of month matches');
    t.equal(next.getHours(), 2, 'Hour matches');
    t.equal(next.getMinutes(), 10, 'Minute matches');

    t.end();
  });
});

test('invalid characters test - symbol', function(t) {
  CronExpression.parse('10 ! 12 8 0', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'Invalid characters, got value: !');

    t.end();
  });
});

test('invalid characters test - letter', function(t) {
  CronExpression.parse('10 x 12 8 0', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'Invalid characters, got value: x');

    t.end();
  });
});

test('invalid characters test - parentheses', function(t) {
  CronExpression.parse('10 ) 12 8 0', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'Invalid characters, got value: )');

    t.end();
  });
});

test('interval with invalid characters test', function(t) {
  CronExpression.parse('10 */A 12 8 0', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'Invalid characters, got value: */A');

    t.end();
  });
});

test('range with invalid characters test', function(t) {
  CronExpression.parse('10 0-z 12 8 0', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'Invalid characters, got value: 0-z');

    t.end();
  });
});

test('group with invalid characters test', function(t) {
  CronExpression.parse('10 0,1,z 12 8 0', function(err, interval) {
    t.ok(err, 'Error expected');
    t.equal(interval, undefined, 'Invalid characters, got value: 0,1,z');

    t.end();
  });
});

test('range test with iterator', function(t) {
  CronExpression.parse('10-30 2 12 8 0', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var intervals = interval.iterate(20);
    t.ok(intervals, 'Found intervals');

    for (var i = 0, c = intervals.length; i < c; i++) {
      var next = intervals[i];

      t.ok(next, 'Found next scheduled interval');
      t.equal(next.getDay(), 0, 'Day matches');
      t.equal(next.getMonth(), 7, 'Month matches');
      t.equal(next.getDate(), 12, 'Day of month matches');
      t.equal(next.getHours(), 2, 'Hour matches');
      t.equal(next.getMinutes(), 10 + i, 'Minute matches');
    }

    t.end();
  });
});

test('incremental range test with iterator', function(t) {
  CronExpression.parse('10-30/2 2 12 8 0', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var intervals = interval.iterate(10);
    t.ok(intervals, 'Found intervals');

    for (var i = 0, c = intervals.length; i < c; i++) {
      var next = intervals[i];

      t.ok(next, 'Found next scheduled interval');
      t.equal(next.getDay(), 0, 'Day matches');
      t.equal(next.getMonth(), 7, 'Month matches');
      t.equal(next.getDate(), 12, 'Day of month matches');
      t.equal(next.getHours(), 2, 'Hour matches');
      t.equal(next.getMinutes(), 10 + (i * 2), 'Minute matches');
    }

    t.end();
  });
});

test('predefined expression', function(t) {
  CronExpression.parse('@yearly', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var date = new Date();
    date.addYear();

    var next = interval.next();
    t.ok(next, 'Found next scheduled interval');

    t.equal(next.getFullYear(), date.getFullYear(), 'Year matches');
    t.end();
  });
});

test('expression limited with start and end date', function(t) {
  var options = {
    currentDate: new Date('Wed, 26 Dec 2012 14:38:53'),
    endDate: new Date('Wed, 26 Dec 2012 16:40:00')
  };

  CronExpression.parse('*/20 * * * *', options, function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var dates = interval.iterate(10);
    t.equal(dates.length, 7, 'Dates count matches');

    interval.reset(); // Reset

    var next = interval.next();
    t.equal(next.getHours(), 14, 'Hour matches');
    t.equal(next.getMinutes(), 40, 'Minute matches');

    next = interval.next();
    t.equal(next.getHours(), 15, 'Hour matches');
    t.equal(next.getMinutes(), 0, 'Minute matches');

    next = interval.next();
    t.equal(next.getHours(), 15, 'Hour matches');
    t.equal(next.getMinutes(), 20, 'Minute matches');

    next = interval.next();
    t.equal(next.getHours(), 15, 'Hour matches');
    t.equal(next.getMinutes(), 40, 'Minute matches');

    next = interval.next();
    t.equal(next.getHours(), 16, 'Hour matches');
    t.equal(next.getMinutes(), 0, 'Minute matches');

    next = interval.next();
    t.equal(next.getHours(), 16, 'Hour matches');
    t.equal(next.getMinutes(), 20, 'Minute matches');

    next = interval.next();
    t.equal(next.getHours(), 16, 'Hour matches');
    t.equal(next.getMinutes(), 40, 'Minute matches');

    try {
      next = interval.next();
      t.ok(false, 'Should fail');
    } catch (e) {
      t.ok(true, 'Failed as expected');
    }

    t.end();
  });
});

test('expression using days of week strings', function(t) {
  CronExpression.parse('15 10 * * MON-TUE', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var intervals = interval.iterate(8);
    t.ok(intervals, 'Found intervals');

    for (var i = 0, c = intervals.length; i < c; i++) {
      var next = intervals[i];
      var day = next.getDay();

      t.ok(next, 'Found next scheduled interval');
      t.ok(day == 1 || day == 2, "Day matches")
      t.equal(next.getHours(), 10, 'Hour matches');
      t.equal(next.getMinutes(), 15, 'Minute matches');
    }

    t.end();
  });
});

test('expression using mixed days of week strings', function(t) {
  CronExpression.parse('15 10 * jAn-FeB mOn-tUE', function(err, interval) {
    t.ifError(err, 'Interval parse error');
    t.ok(interval, 'Interval parsed');

    var intervals = interval.iterate(8);
    t.ok(intervals, 'Found intervals');

    for (var i = 0, c = intervals.length; i < c; i++) {
      var next = intervals[i];
      var day = next.getDay();
      var month = next.getMonth();

      t.ok(next, 'Found next scheduled interval');
      t.ok(month == 0 || month == 2, "Month Matches");
      t.ok(day == 1 || day == 2, "Day matches");
      t.equal(next.getHours(), 10, 'Hour matches');
      t.equal(next.getMinutes(), 15, 'Minute matches');
    }

    t.end();
  });
});


