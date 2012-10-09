'use strict';

var date = require('./date');

function CronInterval(fields, options) {
  this._index = 0;
  this._options = options;
  this._date = new Date(options.date.toUTCString());
  this._fields = {};

  // TODO: Fields should be validated (again)

  // Map fields
  for (var i = 0, c = CronInterval.map.length; i < c; i++) {
    var key = CronInterval.map[i];
    this._fields[key] = fields[i];
  }
}

/**
 * Field mappings
 * @type {Array}
 */
CronInterval.map = [ 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek', 'year' ];

/**
 * Fields constraints
 * @type {Array}
 */
CronInterval.constraints = [
  [ 0, 59 ], // Minute
  [ 0, 23 ], // Hour
  [ 1, 31 ], // Day of month
  [ 0, 11 ], // Month
  [ 0, 6 ], // Day of week
  [ 1970, 2099 ] // Year
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
CronInterval.parseDefaults = [ '*', '*', '*', '*', '*', (new Date()).getFullYear() ];

/**
 * Parse input interval
 *
 * @param   {String} field       Field symbolic name
 * @param   {String} value       Field value
 * @param   {Array} constraints  Range upper and lower constraints
 * @return  {Array}              Sequence of sorted values
 * @private
 */
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
    value = value.replace(/\*/g, constraints[0] + '-' + constraints[1]);
  }

  //
  // Inline parsing functions
  //
  // Parser path:
  //  - parseSequence
  //    - parseRepeat
  //      - parseRange

  /**
   * Parse sequence
   *
   * @param  {String} val
   * @return {Array}
   * @private
   */
  function parseSequence(val) {
    var stack = [];

    function handleResult(result) {
      var max = stack.length > 0 ? Math.max.apply(Math, stack) : -1;

      if (result instanceof Array) { // Make sequence linear
        result.forEach(function(value, index) {
          if (value > max) {
            stack.push(value);
          }

          max = Math.max.apply(Math, stack);
        })
      } else { // Scalar value
        result = parseInt(result);

        if (result > max) {
          stack.push(result);
        }
      }
    }

    if (val.indexOf(',') !== -1) {
      var atoms = val.split(',');

      atoms.forEach(function(value, index) {
        handleResult(parseRepeat(value.toString()));
      });

    } else {
      handleResult(parseRepeat(val));
    }

    return stack;
  }

  /**
   * Parse repetition interval
   *
   * @param  {String} val
   * @return {Array}
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
   * Parse range
   *
   * @param  {String} val
   * @param  {Number} repeatInterval Repetition interval
   * @return {Array}
   * @private
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

/**
 * [_findSchedule description]
 * @param   {[type]} direction [description]
 * @return  {[type]}           [description]
 * @private
 */
CronInterval.prototype._findSchedule = function(direction) {
  var current = new Date(this._date.toUTCString());

  function findNearest(value, sequence) {
    for (var i = 0, c = sequence.length; i < c; i++) {
      if (direction > 0) {
        if (sequence[i] >= value) {
          return sequence[i];
        }
      } else {
        if (sequence[i] <= value) {
          return (i - 1 >= 0) ? sequence[i - 1] : sequence[i];
        }
      }
    }

    return sequence[0];
  }

  function matchSchedule(field, values) {
    var nearest = findNearest(field, values, direction);
    return nearest === field;
  }

  // Reset
  current.addMinute();

  // Iterate and match schedule
  while (true) {
    // Match year
    if (!matchSchedule(current.getFullYear(), this._fields.year)) {
      current.addYear();
      current.setMonth(0);
      current.setDate(1);
      current.setHours(0);
      current.setMinutes(0);
      current.setSeconds(0);
      continue;
    }

    // Match month
    if (!matchSchedule(current.getMonth(), this._fields.month)) {
      current.addMonth();
      current.setDate(1);
      current.setHours(0);
      current.setMinutes(0);
      current.setSeconds(0);
      continue;
    }

    // Match day of month
    if (!matchSchedule(current.getDate(), this._fields.dayOfMonth)) {
      current.addDay();
      current.setHours(0);
      current.setMinutes(0);
      current.setSeconds(0);
      continue;
    }

    // Match day of week
    if (!matchSchedule(current.getDay(), this._fields.dayOfWeek)) {
      current.addDay();
      current.setHours(0);
      current.setMinutes(0);
      current.setSeconds(0);
      continue;
    }

    // Match hour
    if (!matchSchedule(current.getHours(), this._fields.hour)) {
      current.addHour();
      current.setMinutes(0);
      current.setSeconds(0);
      continue;
    }

    // Match minute
    if (!matchSchedule(current.getMinutes(), this._fields.minute)) {
      current.addMinute();
      current.setSeconds(0);
      continue;
    }

    break;
  }

  return (this._date = current);
};

CronInterval.prototype.prev = function() {
  return this._findSchedule(-1);
};

CronInterval.prototype.next = function() {
  return this._findSchedule(1);
};

/**
 * Parse input interval
 *
 * @param  {String}   interval   Input interval
 * @param  {Object}   [options]  Parsing options
 * @param  {Function} callback
 * @public
 */
CronInterval.parse = function(interval, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!options.date) {
    options.date = new Date();
  }

  // Split fields
  var fields = [];
  var atoms = interval.split(' ');

  // Resolve fields
  for (var i = 0, c = CronInterval.map.length; i < c; i++) {
    var field = CronInterval.map[i]; // Field name

    if (i !== atoms.length) { // Parse field
      var value = atoms[i];

      try {
        fields.push(this._parseField(field, value, CronInterval.constraints[i]));
      } catch (e) {
        callback(e);
        return;
      }
    } else { // Use default value
      fields.push(CronInterval.parseDefaults[i]);
    }
  }

  callback(null, new CronInterval(fields, options));
};

module.exports = CronInterval;