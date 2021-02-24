'use strict';

function _compactField(arr, index, current, results) {
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
  var isNumberItem = typeof item === 'number';
  if (!current) {
    current = {
      start: item,
      count: 1,
    };
    if (!isNumberItem) {
      results.push(current);
      return _compactField(arr, nextIndex, undefined, results);
    }
    return _compactField(arr, nextIndex, current, results);
  }
  if (current.count === 1) {
    if (!isNumberItem) {
      results.push(current);
      return _compactField(arr, index, undefined, results);
    }
    current.end = item;
    current.step = item - current.start;
    current.count = 2;
    return _compactField(arr, nextIndex, current, results);
  }
  var currentStep = item - current.end;
  if (isNumberItem && current.step === currentStep) {
    current.count++;
    current.end = item;
    return _compactField(arr, nextIndex, current, results);
  }
  if (current.count === 2) {
    results.push({
      start: current.start,
      count: 1,
    });
    return _compactField(arr, index, {
      start: current.end,
      count: 1,
    }, results);
  }
  results.push(current);
  return _compactField(arr, index, undefined, results);
}

function compactField(arr) {
  var results = [];
  _compactField(arr, 0, undefined, results);
  return results;
}

module.exports = compactField;
