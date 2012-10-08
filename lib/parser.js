'use strict';

var CronInterval = require('./interval');

function CronParser() {

}

CronParser.parseEntry = function(entry, callback) {
  var atoms = entry.split(' ');

  if (atoms.length === 5) {
    CronInterval.parse(entry, callback);
  } else if (atoms.length > 5) {
    CronInterval.parse(entry, function(err, interval) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, {
        interval: interval,
        command: atoms.slice(5, atoms.length);
      });
    });
  } else {
    callback(new Error('Invalid entry: ' + entry));
  }
};

CronParser.parseVariable = function() {

};

module.exports = CronParser;