'use strict';

function buildRange(item) {
  return {
    start: item,
    count: 1,
  };
}

function compactField(arr) {
  var results = [];
  var currentRange;
  var index = 0;

  while (index !== arr.length) {
    var currentItem = arr[index++];
    var currentItemRange = buildRange(currentItem);
    var isNumberItem = typeof currentItem === 'number';
    if (!currentRange) {
      if (!isNumberItem) {
        // String elements can't form a range
        results.push(currentItemRange);
      } else {
        // Start a new range
        currentRange = currentItemRange;
      }
    } else if (currentRange.count === 1) {
      if (!isNumberItem) {
        // String elements can't form a range so persist the previous range
        results.push(currentRange);
        results.push(currentItemRange);
        currentRange = undefined;
      } else {
        // Guess that the current item starts a range
        currentRange.end = currentItem;
        currentRange.step = currentItem - currentRange.start;
        currentRange.count = 2;
      }
    } else {
      if (isNumberItem && currentRange.step === currentItem - currentRange.end) {
        // We found another item that matches the current range
        currentRange.count++;
        currentRange.end = currentItem;
      } else if (currentRange.count === 2) { // The current item can't continue the range
        // Break the first item of the current range into a single element, and try to start a new range with the second item
        // (rechecking the current item again)
        results.push(buildRange(currentRange.start));
        index--;
        currentRange = buildRange(currentRange.end);
      } else {
        // Persist the current range and start a new one with current item
        results.push(currentRange);
        currentRange = currentItemRange;
      }
    }
  }

  if (currentRange) {
    // Two elements do not form a range so split them into 2 single elements
    if (currentRange.count === 2) {
      results.push(buildRange(currentRange.start));
      results.push(buildRange(currentRange.end));
    } else {
      results.push(currentRange);
    }
  }

  return results;
}

module.exports = compactField;
