'use strict';

var date = require('./date');

/**
 * Construct a new expression parser
 *
 * Options:
 *   currentDate: iterator start date
 *   endDate: iterator end date
 *
 * @constructor
 * @private
 * @param {Object} fields  Expression fields parsed values
 * @param {Object} options Parser options
 */
function CronExpression(fields, options) {
  this._options = options;
  this._currentDate = new Date(options.currentDate.toUTCString());
  this._endDate = options.endDate ? new Date(options.endDate.toUTCString()) : null;
  this._fields = {};

  // Map fields
  for (var i = 0, c = CronExpression.map.length; i < c; i++) {
    var key = CronExpression.map[i];
    this._fields[key] = fields[i];
  }
}

/**
 * Field mappings
 * @type {Array}
 */
CronExpression.map = [ 'second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek' ];

/**
 * Prefined intervals
 * @type {Object}
 */
CronExpression.predefined = {
  '@yearly': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@hourly': '0 * * * *'
};

/**
 * Fields constraints
 * @type {Array}
 */
CronExpression.constraints = [
  [ 0, 59 ], // Second
  [ 0, 59 ], // Minute
  [ 0, 23 ], // Hour
  [ 1, 31 ], // Day of month
  [ 1, 12 ], // Month
  [ 0, 6 ] // Day of week
];

/**
 * Field aliases
 * @type {Object}
 */
CronExpression.aliases = {
  month: {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12
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
CronExpression.parseDefaults = [ '0', '*', '*', '*', '*', '*' ];

/**
 * Parse input interval
 *
 * @param   {String} field       Field symbolic name
 * @param   {String} value       Field value
 * @param   {Array} constraints  Range upper and lower constraints
 * @return  {Array}              Sequence of sorted values
 * @private
 */
CronExpression._parseField = function(field, value, constraints) {
  // Replace aliases
  switch (field) {
    case 'month':
    case 'dayOfWeek':
      var aliases = CronExpression.aliases[field];

      value = value.replace(/[a-z]{1,3}/gi, function(match) {
        match = match.toLowerCase();
        if (aliases[match]) {
          return aliases[match];
        } else {
          throw new Error('Cannot resolve alias "' + match + '"')
        }
      });
      break;
  }

  //Check for valid characters.
  if(!CronExpression._validateCharacters(value)){
    throw new Error('Invalid characters, got value: ' + value)
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
          // Check constraints
          if (!CronExpression._validateConstraint(value, constraints)) {
            throw new Error(
              'Constraint error, got value ' + value + ' expected range ' +
              constraints[0] + '-' + constraints[1]
            );
          }

          if (value > max) {
            stack.push(value);
          }

          max = Math.max.apply(Math, stack);
        })
      } else { // Scalar value
        result = parseInt(result, 10);

        // Check constraints
        if (!CronExpression._validateConstraint(result, constraints)) {
          throw new Error(
            'Constraint error, got value ' + result + ' expected range ' +
            constraints[0] + '-' + constraints[1]
          );
        }

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
      if (atoms.length != 2) {
        throw new Error('Invalid range format: ' + val);
      }

      // Validate range
      var min = parseInt(atoms[0], 10);
      var max = parseInt(atoms[1], 10);

      if (Number.isNaN(min) || Number.isNaN(max) ||
          min < constraints[0] || max > constraints[1]) {
        throw new Error(
          'Constraint error, got range ' +
          min + '-' + max +
          ' expected range ' +
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

CronExpression._validateCharacters = function(value) {
  var regex = new RegExp('^[\\d|/|*|\\-|,]+$');
  return regex.test(value);
};

/**
 * Constraint validation
 *
 * @private
 * @static
 * @param  {Object} value     Value to check
 * @return {Boolean}          True if validation succeeds, false if not
 */
CronExpression._validateConstraint = function(value, constraints) {
  if (value < constraints[0] || value > constraints[1]) {
    return false;
  }

  return true;
};

/**
 * Timespan validation
 *
 * @private
 * @static
 * @param  {Date} current Current date
 * @param  {Date} end     End date
 * @return {Boolean}         Return true if timespan is still valid, otherwise return false
 */
CronExpression._validateTimespan = function(current, end) {
  if (end && (end.getTime() - current.getTime()) < 0) {
    return false;
  }

  return true;
};

/**
 * Find next matching schedule date
 *
 * @return  {Number}
 * @private
 */
CronExpression.prototype._findSchedule = function() {
  // Validate timespan
  if (!CronExpression._validateTimespan(this._currentDate, this._endDate)) {
    throw new Error('Out of the timespan range');
  }

  var current = new Date(this._currentDate.toUTCString());

  function findNearest(value, sequence) {
    for (var i = 0, c = sequence.length; i < c; i++) {
      if (sequence[i] >= value) {
        return sequence[i];
      }
    }

    return sequence[0];
  }

  /**
   * Match field value
   *
   * @param  {String} value
   * @param  {Array} sequence
   * @return {Boolean}
   * @private
   */
  function matchSchedule(value, sequence) {
    return findNearest(value, sequence) === value;
  }

  // Reset
  if (this._fields.second.length === 1 && this._fields.second[0] === 0) {
    current.setSeconds(0);
    current.addMinute();
  } else {
    current.addSecond();
  }

  // Iterate and match schedule
  while (true) {
    // Validate timespan
    if (!CronExpression._validateTimespan(current, this._endDate)) {
      throw new Error('Out of the timespan range');
    }

    // Match month
    if (!matchSchedule(current.getMonth() + 1, this._fields.month)) {
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

    // Match second
    if (!matchSchedule(current.getSeconds(), this._fields.second)) {
      current.addSecond();
      continue;
    }

    break;
  }

  return (this._currentDate = current);
};

/**
 * Find next suitable date
 *
 * @public
 * @return {Date}
 */
CronExpression.prototype.next = function() {
  return this._findSchedule();
};

/**
 * Check if next suitable date exists
 *
 * @public
 * @return {Boolean}
 */
CronExpression.prototype.hasNext = function() {
  var memorized = this._currentDate;
  try {
    this.next();
    return true;
  }
  catch(error) {
    return false;
  }
  finally {
    this._currentDate = memorized;
  }
};

/**
 * Iterate over expression iterator
 *
 * @public
 * @param  {Number}   n        Numbers of steps to iterate
 * @param  {Function} callback Optional callback
 * @return {Array}            Array of the iterated results
 */
CronExpression.prototype.iterate = function(n, callback) {
  var dates = [];

  for (var i = 0, c = n; i < c; i++) {
    try {
      var item = this.next();
      dates.push(item);

      // Fire the callback
      if (callback) {
        callback(item, i);
      }
    } catch (e) {
      break;
    }
  }

  return dates;
};

/**
 * Reset expression iterator state
 *
 * @public
 */
CronExpression.prototype.reset = function() {
  this._currentDate = new Date(this._options.currentDate.toUTCString());
};

/**
 * Parse input expression (async)
 *
 * @public
 * @param  {String}   expression   Input expression
 * @param  {Object}   [options]  Parsing options
 * @param  {Function} callback
 */
CronExpression.parse = function(expression, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  try {
    var cronExpression = CronExpression.parseSync(expression, options);
    callback(null, cronExpression);
  } catch (e){
    callback(e);
  }
}

/**
 * Parse input expression (sync)
 *
 * @public
 * @param  {String}   expression   Input expression
 * @param  {Object}   [options]  Parsing options
 */
CronExpression.parseSync = function(expression, options) {
  if (!options) {
    options = {};
  }

  if (!options.currentDate) {
    options.currentDate = new Date();
  }

  // Is input expression predefined?
  if (CronExpression.predefined[expression]) {
    expression = CronExpression.predefined[expression];
  }

  // Split fields
  var fields = [];
  var atoms = expression.split(' ');

  // Resolve fields
  var start = (CronExpression.map.length - atoms.length);
  for (var i = 0, c = CronExpression.map.length; i < c; ++i) {
    var field = CronExpression.map[i]; // Field name
    var value = atoms[atoms.length > c ? i : i - start]; // Field value

    if (i < start || !value) {
      fields.push(this._parseField(field, CronExpression.parseDefaults[i], CronExpression.constraints[i]));
    } else { // Use default value
      fields.push(this._parseField(field, value, CronExpression.constraints[i]));
    }
  }

  return new CronExpression(fields, options);
};

module.exports = CronExpression;
