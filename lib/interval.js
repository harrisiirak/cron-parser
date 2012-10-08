'use strict';

function CronInterval() {

}

/**
 * Field mappings
 * @type {Array}
 */
CronInterval.map = [ 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

/**
 * Fields constraints
 * @type {Array}
 */
CronInterval.constraints = [
  [ 0, 59 ], // Minute
  [ 0, 23 ], // Hour
  [ 1, 31 ], // Day of month
  [ 0, 11 ], // Month
  [ 0, 6 ] // Day of week
];

/**
 * Field aliases
 * @type {Object}
 */
CronInterval.aliases = {
  month: {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
  },

  dayOfWeek: {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6
  }
};

/**
 * Field defaults
 * @type {Array}
 */
CronInterval.parseDefaults = [ '*', '*', '*', '*', '*' ];

CronInterval._parseField = function(field, value, constraints) {
  // Replace aliases
  switch (field) {
    case 'month':
    case 'dayOfWeek':
      var aliases = CronInterval.aliases[field];

      value = value.replace(/[a-z]{1,3}/gi, function(match) {
        if (aliases[match]) {
          return aliases[match];
        } else {
          throw new Error('Cannot resolve alias "' + match + '"')
        }
      });
      break;
  }

  // Replace '*'
  if (value.indexOf('*') !== -1) {
    value = value.replace('\*', constraints[0] + '-' + constraints[1]);
  }

  //
  // Inline parsing functions
  //

  /**
   * [parseSequence description]
   * @param  {[type]} val [description]
   * @return {[type]}     [description]
   */
  function parseSequence(val) {
    var stack = [];

    if (val.indexOf(',') !== -1) {
      var atoms = val.split(',');

      atoms.forEach(function(value, index) {
        var ret = parseRepeat(value.toString());
        var max = stack.length > 0 ? Math.max.apply(Math, stack) : 0;

        if (ret instanceof Array) { // Make sequence linear
          ret.forEach(function(value, index) {
            if (value && (value > max)) {
              stack.push(value);
            }

            max = Math.max.apply(Math, stack);
          })
        } else { // Scalar value
          ret = parseInt(ret);

          if (ret && (ret > max)) {
            stack.push(ret);
          }
        }
      });

      return stack;
    } else {
      return parseRepeat(value);
    }
  }

  /**
   * [parseRepeat description]
   * @param  {[type]} val [description]
   * @return {[type]}     [description]
   */
  function parseRepeat(val) {
    var repeatInterval = 1;

    if (val.indexOf('/') !== -1) {
      var atoms = val.split('/');
      repeatInterval = atoms[atoms.length - 1];

      return parseRange(atoms[0], repeatInterval);
    } else {
      return parseRange(val, repeatInterval);
    }
  }

  /**
   * [parseRange description]
   * @param  {[type]} val            [description]
   * @param  {[type]} repeatInterval [description]
   * @return {[type]}                [description]
   */
  function parseRange(val, repeatInterval) {
    var stack = [];

    if (val.indexOf('-') !== -1) {
      var atoms = val.split('-');

      // Validate format
      if (atoms.length > 2) {
        throw new Error('Invalid range format: ' + val);
      }

      // Validate range
      var min = parseInt(atoms[0]);
      var max = parseInt(atoms[1]);

      if (min < constraints[0] || max > constraints[1]) {
        throw new Error(
          'Constraint error, got range ' +
          min + '-' + max +
          ' excpected range ' +
          constraints[0] + '-' + constraints[1]
        );
      } else if (min >= max) {
        throw new Error('Invalid range: ' + val);
      }

      // Create range
      var repeatIndex = repeatInterval;
      for (var index = min, count = max; index <= count; index++) {
        if (repeatIndex > 0 && (repeatIndex % repeatInterval) === 0) {
          repeatIndex = 1;
          stack.push(index);
        } else {
          repeatIndex++;
        }
      }

      return stack;
    } else {
      return val;
    }
  }

  return parseSequence(value);
};

CronInterval.prototype.prev = function() {

};

CronInterval.prototype.next = function() {

};

CronInterval.parse = function(interval, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // Split fields
  var fields = [];
  var atoms = interval.split(' ');

  if (atoms.length !== CronInterval.map.length) {
    callback(new Error('Invalid number of fields'));
    return;
  }

  // Resolve fields
  for (var i = 0, c = CronInterval.map.length; i < c; i++) {
    var field = CronInterval.map[i]; // Field name
    var value = atoms[i];

    fields.push(this._parseField(field, value, CronInterval.constraints[i]));
  }

  var util = require('util');
  console.log(util.inspect(fields, false, 100));
};

module.exports = CronInterval;