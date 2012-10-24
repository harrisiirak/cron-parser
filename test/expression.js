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
  	t.equal(next.getMonth(), 8, 'Month matches');
  	t.equal(next.getDate(), 12, 'Day of month matches');
  	t.equal(next.getHours(), 2, 'Hour matches');
  	t.equal(next.getMinutes(), 10, 'Minute matches');

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
	  	t.equal(next.getMonth(), 8, 'Month matches');
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
	  	t.equal(next.getMonth(), 8, 'Month matches');
	  	t.equal(next.getDate(), 12, 'Day of month matches');
	  	t.equal(next.getHours(), 2, 'Hour matches');
	  	t.equal(next.getMinutes(), 10 + (i * 2), 'Minute matches');
  	}

  	t.end();
  });
});

test('prefined expression', function(t) {
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