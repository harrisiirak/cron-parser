'use strict';

function _findRanges(arr, index, current, results) {
  if (index === arr.length) {
    if (current) {
      if (current.count === 2) {
        results.push({
          start: current.start,
          count: 1,
        });
        results.push({
          start: current.end,
          count: 1,
        });
      } else {
        results.push(current);
      }
    }
    return;
  }
  var item = arr[index];
  var nextIndex = index + 1;
  if (!current) {
    return _findRanges(arr, nextIndex, {
      start: item,
      count: 1,
    }, results);
  }
  if (current.count === 1) {
    current.end = item;
    current.step = item - current.start;
    current.count = 2;
    return _findRanges(arr, nextIndex, current, results);
  }
  var currentStep = item - current.end;
  if (current.step === currentStep) {
    current.count++;
    current.end = item;
    return _findRanges(arr, nextIndex, current, results);
  }
  if (current.count === 2) {
    results.push({
      start: current.start,
      count: 1,
    });
    return _findRanges(arr, index, {
      start: current.end,
      count: 1,
    }, results);
  }
  results.push(current);
  return _findRanges(arr, nextIndex, {
    start: item,
    count: 1,
  }, results);
}

function findRanges(arr) {
  var results = [];
  _findRanges(arr, 0, undefined, results);
  return results;
}

module.exports = findRanges;
