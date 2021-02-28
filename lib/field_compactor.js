'use strict';

function _compactField(arr, index, current, results) {
  if (index === arr.length) {
    if (current) {
      // Two elements do not form a range so split them into 2 single elements
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
  var isNumberItem = typeof item === 'number';
  if (!current) {
    current = {
      start: item,
      count: 1,
    };
    if (!isNumberItem) {
      // String elements can form a range
      results.push(current);
      return _compactField(arr, index + 1, undefined, results);
    }
    return _compactField(arr, index + 1, current, results);
  }
  if (current.count === 1) {
    if (!isNumberItem) {
      // String elements can form a range so persist the previous element
      results.push(current);
      results.push({
        start: item,
        count: 1,
      });
      return _compactField(arr, index + 1, undefined, results);
    }
    // Guess that the current item starts a range
    current.end = item;
    current.step = item - current.start;
    current.count = 2;
    return _compactField(arr, index + 1, current, results);
  }
  var currentStep = item - current.end;
  if (isNumberItem && current.step === currentStep) {
    // We found another item that matches the current range
    current.count++;
    current.end = item;
    return _compactField(arr, index + 1, current, results);
  }
  // The current item can't continue the range
  if (current.count === 2) {
    // Break the first item of the current range into a single element, and try to start a new range with the second item
    // (rechecking the current item again)
    results.push({
      start: current.start,
      count: 1,
    });
    return _compactField(arr, index, {
      start: current.end,
      count: 1,
    }, results);
  }
  // Persist the current range and start a new one with current item
  results.push(current);
  return _compactField(arr, index + 1, {
    start: item,
    count: 1,
  }, results);
}

function compactField(arr) {
  var results = [];
  _compactField(arr, 0, undefined, results);
  return results;
}

module.exports = compactField;
