var util = require('util');
var test = require('tap').test;
var CronParser = require('../lib/parser');

test('parse cron with last day in a month', function(t) {
  var options = {
    currentDate: new Date(2014, 0, 1),
    endDate: new Date(2014, 10, 1)
  };

  try {
    var interval = CronParser.parseExpression('0 0 L * *', options);
    t.equal(interval.hasNext(), true);

    for (i = 0; i < 10; ++i) {
      var next = interval.next();
      t.ok(next, 'has a date');
    }

  } catch (err) {
    t.error(err, 'Parse read error');
  }

  t.end();
});

test('parse cron with last day in feb', function(t) {
  var options = {
    currentDate: new Date(2016, 0, 1),
    endDate: new Date(2016, 10, 1)
  };

  try {
    var interval = CronParser.parseExpression('0 0 6-20/2,L 2 *', options);
    t.equal(interval.hasNext(), true);
    var next = null;
    var items = 9;
    var i = 0;
    while(interval.hasNext()) {
      next = interval.next();
      i += 1;
      t.ok(next, 'has a date');
    }
    //leap year
    t.equal(next.getDate(), 29);
    t.equal(i, items);

  } catch (err) {
    t.error(err, 'Parse read error');
  }

  t.end();
});

test('parse cron with last day in feb', function(t) {
  var options = {
    currentDate: new Date(2014, 0, 1),
    endDate: new Date(2014, 10, 1)
  };

  try {
    var interval = CronParser.parseExpression('0 0 1,3,6-10,L 2 *', options);
    t.equal(interval.hasNext(), true);
    var next = null;
    while(interval.hasNext()) {
      next = interval.next();
      t.ok(next, 'has a date');
    }
    //common year
    t.equal(next.getDate(), 28);

  } catch (err) {
    t.error(err, 'Parse read error');
  }

  t.end();
});

