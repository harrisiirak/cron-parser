'use strict';

var CronExpression = require('./expression');

function CronParser() {

}

CronParser.parseDateExpression = function(expression, options, callback) {
  return CronExpression.parse(expression, options, callback);
};

CronParser.parseEntry = function(entry, callback) {
  var atoms = entry.split(' ');

  if (atoms.length === 5) {
    CronExpression.parse(entry, callback);
  } else if (atoms.length > 5) {
    CronExpression.parse(entry, function(err, interval) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, {
        interval: interval,
        command: atoms.slice(5, atoms.length)
      });
    });
  } else {
    callback(new Error('Invalid entry: ' + entry));
  }
};

CronParser.parseVariable = function() {

};

module.exports = CronParser;