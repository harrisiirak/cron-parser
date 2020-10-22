// empty around comma

var test = require('tap').test;
var CronExpression = require('../lib/expression');

test('both empty around comma', function (t) {
  const options = {
    utc: true
  };
  const instance = CronExpression.parse('*/10 * * * * ,', options);
  t.deepEqual(instance._fields.dayOfWeek, [0, 1, 2, 3, 4, 5, 6, 7]);

  t.end();
});

test('one side empty around comma', function (t) {
  const options = {
    utc: true
  };
  const instance = CronExpression.parse('*/10 * * * * ,2', options);
  t.deepEqual(instance._fields.dayOfWeek, [2]);

  t.end();
});