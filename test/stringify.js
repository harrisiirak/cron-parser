var test = require('tap').test;
var CronParser = require('../lib/parser');

test('stringify cron expression all stars no seconds', function (t) {

  try {
    var expected = '0 * * * * *';
    var interval = CronParser.parseExpression('* * * * *', {});
    var str = interval.stringify();
    t.equal(str, expected);
    str = CronParser.stringifyExpression(interval.fields);
    t.equal(str, expected);

  } catch (err) {
    t.ifError(err, 'Parse read error');
  }

  t.end();
});

test('stringify cron expression all stars with seconds', function (t) {

  try {
    var expected = '* * * * * *';
    var interval = CronParser.parseExpression('* * * * * *', {});
    var str = interval.stringify();
    t.equal(str, expected);
    str = CronParser.stringifyExpression(interval.fields);
    t.equal(str, expected);

  } catch (err) {
    t.ifError(err, 'Parse read error');
  }

  t.end();
});

test('stringify cron expression', function (t) {

  try {
    var expected = '0 1,2,4-10,20-35/5,57 * * * *';
    var interval = CronParser.parseExpression('1,2,4-10,20-35/5,57 * * * *', {});
    var str = interval.stringify();
    t.equal(str, expected);
    str = CronParser.stringifyExpression(interval.fields);
    t.equal(str, expected);

  } catch (err) {
    t.ifError(err, 'Parse read error');
  }

  t.end();
});

test('stringify cron expression with star range step', function (t) {

  try {
    var expected = '0 */5 */2 * * *';
    var interval = CronParser.parseExpression('*/5 */2 */1 * *', {});
    var str = interval.stringify();
    t.equal(str, expected);
    str = CronParser.stringifyExpression(interval.fields);
    t.equal(str, expected);

  } catch (err) {
    t.ifError(err, 'Parse read error');
  }

  t.end();
});

test('stringify cron expression with L', function (t) {

  try {
    var expected = '0 * * 1,4-10,L * *';
    var interval = CronParser.parseExpression('* * 1,4-10,L * *', {});
    var str = interval.stringify();
    t.equal(str, expected);
    str = CronParser.stringifyExpression(interval.fields);
    t.equal(str, expected);

  } catch (err) {
    t.ifError(err, 'Parse read error');
  }

  t.end();
});

test('stringify from fields out of order + default values', function (t) {

  try {
    var expected = '1-5 1 1 1 * 1';
    var str =     CronParser.stringifyExpression({
      second: [5,2,1,4,3],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      dayOfWeek: [1],
    });
    t.equal(str, expected);
  } catch (err) {
    t.ifError(err, 'Parse read error');
  }

  t.end();
});

test('validation error - missing values', function (t) {
  t.throws(function () {
    CronParser.stringifyExpression({
      second: [],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    });
  }, new Error('Validation error, Field second contains no values'));

  t.end();
});

test('validation error - range error', function (t) {
  t.throws(function () {
    CronParser.stringifyExpression({
      second: [-1, 1, 0],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    });
  }, new Error('Constraint error, got value -1 expected range 0-59'));

  t.end();
});

test('validation error - bad chars error', function (t) {
  t.throws(function () {
    CronParser.stringifyExpression({
      second: [0, 'R'],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    });
  }, new Error('Constraint error, got value R expected range 0-59'));

  t.end();
});

test('validation error - duplicates', function (t) {
  t.throws(function () {
    CronParser.stringifyExpression({
      second: [1, 1],
      minute: [1],
      hour: [1],
      dayOfMonth: [1],
      month: [1],
      dayOfWeek: [1],
    });
  }, new Error('Validation error, Field second contains duplicate values'));

  t.end();
});
