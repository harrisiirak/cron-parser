var test = require('tap').test;
var findRanges = require('../lib/ranges_finder');

test('find ranges - empty array', function(t) {
  try {
    var result = findRanges([]);
    t.same(result, []);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});

test('find ranges - single element array', function(t) {
  try {
    var result = findRanges([1]);
    t.same(result, [{
      start: 1,
      count: 1
    }]);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});

test('find ranges - 2 elements array', function(t) {
  try {
    var result = findRanges([1, 2]);
    t.same(result, [
      {
        start: 1,
        count: 1
      },
      {
        start: 2,
        count: 1
      }
    ]);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});

test('find ranges - 2 elements array big step', function(t) {
  try {
    var result = findRanges([1, 5]);
    t.same(result, [
      {
        start: 1,
        count: 1
      },
      {
        start: 5,
        count: 1
      }
    ]);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});

test('find ranges - 3 elements array 1 step', function(t) {
  try {
    var result = findRanges([1, 2, 3]);
    t.same(result, [
      {
        start: 1,
        end: 3,
        count: 3,
        step: 1
      }
    ]);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});

test('find ranges - 3 elements array 1 step, dangling extra at end', function(t) {
  try {
    var result = findRanges([1, 2, 3, 5]);
    t.same(result, [
      {
        start: 1,
        end: 3,
        count: 3,
        step: 1
      },
      {
        start: 5,
        count: 1
      }
    ]);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});

test('find ranges - 3 elements array 1 step, dangling extra at end and beginning', function(t) {
  try {
    var result = findRanges([1, 4, 5, 6, 9]);
    t.same(result, [
      {
        start: 1,
        count: 1
      },
      {
        start: 4,
        end: 6,
        count: 3,
        step: 1
      },
      {
        start: 9,
        count: 1
      }
    ]);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});

test('find ranges - 2 ranges with dangling in the middle', function(t) {
  try {
    var result = findRanges([1, 2, 3, 6, 9, 11, 13]);
    t.same(result, [
      {
        start: 1,
        end: 3,
        count: 3,
        step: 1
      },
      {
        start: 6,
        count: 1
      },
      {
        start: 9,
        end: 13,
        count: 3,
        step: 2
      }
    ]);
  } catch (err) {
    t.ifError(err, 'find ranges error');
  }
  t.end();
});
