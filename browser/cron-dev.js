(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Extends Javascript Date class by adding
 * utility methods for basic date incrementation
 */

/**
 * Increment year
 */
Date.prototype.addYear = function addYear () {
  this.setFullYear(this.getFullYear() + 1);
};

/**
 * Increment month
 */
Date.prototype.addMonth = function addMonth () {
  this.setMonth(this.getMonth() + 1);
  this.setDate(1);
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
};

/**
 * Increment day
 */
Date.prototype.addDay = function addDay () {
  var day = this.getDate();
  this.setDate(day + 1);

  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);

  if (this.getDate() === day) {
    this.setDate(day + 2);
  }
};

/**
 * Increment hour
 */
Date.prototype.addHour = function addHour () {
  var hours = this.getHours();
  this.setHours(hours + 1);

  if (this.getHours() === hours) {
    this.setHours(hours + 2);
  }

  this.setMinutes(0);
  this.setSeconds(0);
};

/**
 * Increment minute
 */
Date.prototype.addMinute = function addMinute () {
  this.setMinutes(this.getMinutes() + 1);
  this.setSeconds(0);
};

/**
 * Increment second
 */
Date.prototype.addSecond = function addSecond () {
  this.setSeconds(this.getSeconds() + 1);
};

},{}],2:[function(require,module,exports){
'use strict';

// Load Date class extensions
require('./date');

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
function CronExpression (fields, options) {
  this._options = options;
  this._currentDate = new Date(options.currentDate);
  this._endDate = options.endDate ? new Date(options.endDate) : null;
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
  [ 0, 7 ] // Day of week
];

/**
 * Days in month
 * @type {number[]}
 */
CronExpression.daysInMonth = [
  31,
  28,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31
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
 * @param {String} field Field symbolic name
 * @param {String} value Field value
 * @param {Array} constraints Range upper and lower constraints
 * @return {Array} Sequence of sorted values
 * @private
 */
CronExpression._parseField = function _parseField (field, value, constraints) {
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

  // Check for valid characters.
  if (!(/^[\d|/|*|\-|,]+$/.test(value))) {
    throw new Error('Invalid characters, got value: ' + value)
  }

  // Replace '*'
  if (value.indexOf('*') !== -1) {
    value = value.replace(/\*/g, constraints.join('-'));
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
   * @param {String} val
   * @return {Array}
   * @private
   */
  function parseSequence (val) {
    var stack = [];

    function handleResult (result) {
      var max = stack.length > 0 ? Math.max.apply(Math, stack) : -1;

      if (result instanceof Array) { // Make sequence linear
        for (var i = 0, c = result.length; i < c; i++) {
          var value = result[i];

          // Check constraints
          if (value < constraints[0] || value > constraints[1]) {
            throw new Error(
                'Constraint error, got value ' + value + ' expected range ' +
                constraints[0] + '-' + constraints[1]
            );
          }

          if (value > max) {
            stack.push(value);
          }

          max = Math.max.apply(Math, stack);
        }
      } else { // Scalar value
        result = +result;

        // Check constraints
        if (result < constraints[0] || result > constraints[1]) {
          throw new Error(
            'Constraint error, got value ' + result + ' expected range ' +
            constraints[0] + '-' + constraints[1]
          );
        }

        if (field == 'dayOfWeek') {
          result = result % 7;
        }

        if (result > max) {
          stack.push(result);
        }
      }
    }

    var atoms = val.split(',');
    if (atoms.length > 1) {
      for (var i = 0, c = atoms.length; i < c; i++) {
        handleResult(parseRepeat(atoms[i]));
      }
    } else {
      handleResult(parseRepeat(val));
    }

    return stack;
  }

  /**
   * Parse repetition interval
   *
   * @param {String} val
   * @return {Array}
   */
  function parseRepeat (val) {
    var repeatInterval = 1;
    var atoms = val.split('/');

    if (atoms.length > 1) {
      return parseRange(atoms[0], atoms[atoms.length - 1]);
    }

    return parseRange(val, repeatInterval);
  }

  /**
   * Parse range
   *
   * @param {String} val
   * @param {Number} repeatInterval Repetition interval
   * @return {Array}
   * @private
   */
  function parseRange (val, repeatInterval) {
    var stack = [];
    var atoms = val.split('-');

    if (atoms.length > 1 ) {
      // Invalid range, return value
      if (atoms.length < 2 || !atoms[0].length) {
        return +val;
      }

      // Validate range
      var min = +atoms[0];
      var max = +atoms[1];

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
    }

    return +val;
  }

  return parseSequence(value);
};

/**
 * Find next matching schedule date
 *
 * @return {Date}
 * @private
 */
CronExpression.prototype._findSchedule = function _findSchedule () {
  /**
   * Match field value
   *
   * @param {String} value
   * @param {Array} sequence
   * @return {Boolean}
   * @private
   */
  function matchSchedule (value, sequence) {
    for (var i = 0, c = sequence.length; i < c; i++) {
      if (sequence[i] >= value) {
        return sequence[i] === value;
      }
    }

    return sequence[0] === value;
  }

  /**
   * Detect if input range fully matches constraint bounds
   * @param {Array} range Input range
   * @param {Array} constraints Input constraints
   * @returns {Boolean}
   * @private
   */
  function isWildcardRange (range, constraints) {
    if (range instanceof Array && !range.length) {
      return false;
    }

    if (constraints.length !== 2) {
      return false;
    }

    return range.length === (constraints[1] - (constraints[0] < 1 ? - 1 : 0));
  }

  var currentDate = new Date(this._currentDate);
  var endDate = this._endDate;

  // Append minute if second is 0
  if (this._fields.second[0] === 0) {
    currentDate.addMinute();
  }

  // Find matching schedule
  while (true) {
    // Validate timespan
    if (endDate && (endDate.getTime() - currentDate.getTime()) < 0) {
      throw new Error('Out of the timespan range');
    }
    
    // Day of month and week matching:
    //
    // "The day of a command's execution can be specified by two fields --
    // day of month, and day of week.  If  both	 fields	 are  restricted  (ie,
    // aren't  *),  the command will be run when either field matches the cur-
    // rent time.  For example, "30 4 1,15 * 5" would cause a command to be
    // run at 4:30 am on the  1st and 15th of each month, plus every Friday."
    //
    // http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5
    //

    var dayOfMonthMatch = matchSchedule(currentDate.getDate(), this._fields.dayOfMonth);
    var dayOfWeekMatch = matchSchedule(currentDate.getDay(), this._fields.dayOfWeek);

    var isDayOfMonthWildcardMatch = isWildcardRange(this._fields.dayOfMonth, CronExpression.constraints[3]);
    var isMonthWildcardMatch = isWildcardRange(this._fields.dayOfWeek, CronExpression.constraints[4]);
    var isDayOfWeekWildcardMatch = isWildcardRange(this._fields.dayOfWeek, CronExpression.constraints[5]);

    // Validate days in month if explicit value is given
    if (!isMonthWildcardMatch) {
      var currentYear = currentDate.getYear();
      var currentMonth = currentDate.getMonth() + 1;
      var previousMonth = currentMonth === 1 ? 11 : currentMonth - 1;
      var daysInPreviousMonth = CronExpression.daysInMonth[previousMonth - 1];
      var daysOfMontRangeMax = this._fields.dayOfMonth[this._fields.dayOfMonth.length - 1];

      // Handle leap year
      var isLeap = !((currentYear % 4) || (!(currentYear % 100) && (currentYear % 400)));
      if (isLeap) {
        daysInPreviousMonth = 29;
      }

      if (this._fields.month[0] === previousMonth && daysInPreviousMonth < daysOfMontRangeMax) {
        throw new Error('Invalid explicit day of month definition');
      }
    }

    // Add day if not day of month is set (and no match) and day of week is wildcard
    if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !dayOfMonthMatch) {
      currentDate.addDay();
      continue;
    }

    // Add day if not day of week is set (and no match) and day of month is wildcard
    if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !dayOfWeekMatch) {
      currentDate.addDay();
      continue;
    }

    // Add day if day of mont and week are non-wildcard values and both doesn't match
    if (!(isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch) &&
        !dayOfMonthMatch && !dayOfWeekMatch) {
      currentDate.addDay();
      continue;
    }

    // Match month
    if (!matchSchedule(currentDate.getMonth() + 1, this._fields.month)) {
      currentDate.addMonth();
      continue;
    }

    // Match hour
    if (!matchSchedule(currentDate.getHours(), this._fields.hour)) {
      currentDate.addHour();
      continue;
    }

    // Match minute
    if (!matchSchedule(currentDate.getMinutes(), this._fields.minute)) {
      currentDate.addMinute();
      continue;
    }

    // Match second
    if (!matchSchedule(currentDate.getSeconds(), this._fields.second)) {
      currentDate.addSecond();
      continue;
    }
    break;
  }

  return (this._currentDate = currentDate);
};

/**
 * Find next suitable date
 *
 * @public
 * @return {Date}
 */
CronExpression.prototype.next = function next () {
  return this._findSchedule();
};

/**
 * Check if next suitable date exists
 *
 * @public
 * @return {Boolean}
 */
CronExpression.prototype.hasNext = function() {
  var current = this._currentDate;

  try {
    this.next();
    return true;
  } catch (err) {
    return false;
  } finally {
    this._currentDate = current;
  }
};

/**
 * Iterate over expression iterator
 *
 * @public
 * @param {Number} steps Numbers of steps to iterate
 * @param {Function} callback Optional callback
 * @return {Array} Array of the iterated results
 */
CronExpression.prototype.iterate = function iterate (steps, callback) {
  var dates = [];

  for (var i = 0, c = steps; i < c; i++) {
    try {
      var item = this.next();
      dates.push(item);

      // Fire the callback
      if (callback) {
        callback(item, i);
      }
    } catch (err) {
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
CronExpression.prototype.reset = function reset () {
  this._currentDate = new Date(this._options.currentDate);
};

/**
 * Parse input expression (async)
 *
 * @public
 * @param {String} expression Input expression
 * @param {Object} [options] Parsing options
 * @param {Function} callback
 */
CronExpression.parse = function parse (expression, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  function parse (expression, options) {
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
        fields.push(CronExpression._parseField(
          field,
          CronExpression.parseDefaults[i],
          CronExpression.constraints[i])
        );
      } else { // Use default value
        fields.push(CronExpression._parseField(
          field,
          value,
          CronExpression.constraints[i])
        );
      }
    }

    return new CronExpression(fields, options);
  }

  // Backward compatibility (<= 0.3.*)
  // Will be removed in version 0.5
  if (typeof callback === 'function') {
    try {
      return callback(null, parse(expression, options));
    } catch (err) {
      return callback(err);
    }
  } else {
    return parse(expression, options);
  }
};

module.exports = CronExpression;

},{"./date":1}],3:[function(require,module,exports){
'use strict';

var CronExpression = require('./expression');

function CronParser() {}

/**
 * Parse crontab entry
 *
 * @private
 * @param {String} entry Crontab file entry/line
 */
CronParser._parseEntry = function _parseEntry (entry) {
  var atoms = entry.split(' ');

  if (atoms.length === 6) {
    return {
      interval: CronExpression.parse(entry)
    };
  } else if (atoms.length > 6) {
    return {
      interval: CronExpression.parse(entry),
      command: atoms.slice(6, atoms.length)
    };
  } else {
    throw new Error('Invalid entry: ' + entry);
  }
};

/**
 * Wrapper for CronExpression.parser method
 *
 * @public
 * @param {String} expression Input expression
 * @param {Object} [options] Parsing options
 * @return {Object}
 */
CronParser.parseExpression = function parseExpression (expression, options, callback) {
  return CronExpression.parse(expression, options, callback);
};


/**
 * Wrapper for CronExpression.parserSync method
 *
 * @public
 * @deprecated
 * @param {String} expression Input expression
 * @param {Object} [options] Parsing options
 */
CronParser.parseExpressionSync = CronParser.parseExpression;

/**
 * Parse content string
 *
 * @public
 * @param {String} data Crontab content
 * @return {Object}
 */
CronParser.parseString = function parseString (data) {
  var self = this;
  var blocks = data.split('\n');

  var response = {
    variables: {},
    expressions: [],
    errors: {}
  };

  for (var i = 0, c = blocks.length; i < c; i++) {
    var block = blocks[i];
    var matches = null;
    var entry = block.replace(/^\s+|\s+$/g, ''); // Remove surrounding spaces

    if (entry.length > 0) {
      if (entry.match(/^#/)) { // Comment
        continue;
      } else if ((matches = entry.match(/^(.*)=(.*)$/))) { // Variable
        response.variables[matches[1]] = matches[2];
      } else { // Expression?
        var result = null;

        try {
          result = self._parseEntry('0 ' + entry);
          response.expressions.push(result.interval);
        } catch (err) {
          response.errors[entry] = err;
        }
      }
    }
  }

  return response;
};

/**
 * Parse crontab file
 *
 * @public
 * @param {String} filePath Path to file
 * @param {Function} callback
 */
CronParser.parseFile = function parseFile (filePath, callback) {
  require('fs').readFile(filePath, function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    return callback(null, CronParser.parseString(data.toString()));
  });
};

module.exports = CronParser;

},{"./expression":2,"fs":4}],4:[function(require,module,exports){

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zdGFrYWNoL0RvY3VtZW50cy9wcm9qZWN0cy9jcm9uLXBhcnNlci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc3Rha2FjaC9Eb2N1bWVudHMvcHJvamVjdHMvY3Jvbi1wYXJzZXIvbGliL2RhdGUuanMiLCIvVXNlcnMvc3Rha2FjaC9Eb2N1bWVudHMvcHJvamVjdHMvY3Jvbi1wYXJzZXIvbGliL2V4cHJlc3Npb24uanMiLCIvVXNlcnMvc3Rha2FjaC9Eb2N1bWVudHMvcHJvamVjdHMvY3Jvbi1wYXJzZXIvbGliL2Zha2VfMjUwZmE2MTguanMiLCIvVXNlcnMvc3Rha2FjaC9Eb2N1bWVudHMvcHJvamVjdHMvY3Jvbi1wYXJzZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEV4dGVuZHMgSmF2YXNjcmlwdCBEYXRlIGNsYXNzIGJ5IGFkZGluZ1xuICogdXRpbGl0eSBtZXRob2RzIGZvciBiYXNpYyBkYXRlIGluY3JlbWVudGF0aW9uXG4gKi9cblxuLyoqXG4gKiBJbmNyZW1lbnQgeWVhclxuICovXG5EYXRlLnByb3RvdHlwZS5hZGRZZWFyID0gZnVuY3Rpb24gYWRkWWVhciAoKSB7XG4gIHRoaXMuc2V0RnVsbFllYXIodGhpcy5nZXRGdWxsWWVhcigpICsgMSk7XG59O1xuXG4vKipcbiAqIEluY3JlbWVudCBtb250aFxuICovXG5EYXRlLnByb3RvdHlwZS5hZGRNb250aCA9IGZ1bmN0aW9uIGFkZE1vbnRoICgpIHtcbiAgdGhpcy5zZXRNb250aCh0aGlzLmdldE1vbnRoKCkgKyAxKTtcbiAgdGhpcy5zZXREYXRlKDEpO1xuICB0aGlzLnNldEhvdXJzKDApO1xuICB0aGlzLnNldE1pbnV0ZXMoMCk7XG4gIHRoaXMuc2V0U2Vjb25kcygwKTtcbn07XG5cbi8qKlxuICogSW5jcmVtZW50IGRheVxuICovXG5EYXRlLnByb3RvdHlwZS5hZGREYXkgPSBmdW5jdGlvbiBhZGREYXkgKCkge1xuICB2YXIgZGF5ID0gdGhpcy5nZXREYXRlKCk7XG4gIHRoaXMuc2V0RGF0ZShkYXkgKyAxKTtcblxuICB0aGlzLnNldEhvdXJzKDApO1xuICB0aGlzLnNldE1pbnV0ZXMoMCk7XG4gIHRoaXMuc2V0U2Vjb25kcygwKTtcblxuICBpZiAodGhpcy5nZXREYXRlKCkgPT09IGRheSkge1xuICAgIHRoaXMuc2V0RGF0ZShkYXkgKyAyKTtcbiAgfVxufTtcblxuLyoqXG4gKiBJbmNyZW1lbnQgaG91clxuICovXG5EYXRlLnByb3RvdHlwZS5hZGRIb3VyID0gZnVuY3Rpb24gYWRkSG91ciAoKSB7XG4gIHZhciBob3VycyA9IHRoaXMuZ2V0SG91cnMoKTtcbiAgdGhpcy5zZXRIb3Vycyhob3VycyArIDEpO1xuXG4gIGlmICh0aGlzLmdldEhvdXJzKCkgPT09IGhvdXJzKSB7XG4gICAgdGhpcy5zZXRIb3Vycyhob3VycyArIDIpO1xuICB9XG5cbiAgdGhpcy5zZXRNaW51dGVzKDApO1xuICB0aGlzLnNldFNlY29uZHMoMCk7XG59O1xuXG4vKipcbiAqIEluY3JlbWVudCBtaW51dGVcbiAqL1xuRGF0ZS5wcm90b3R5cGUuYWRkTWludXRlID0gZnVuY3Rpb24gYWRkTWludXRlICgpIHtcbiAgdGhpcy5zZXRNaW51dGVzKHRoaXMuZ2V0TWludXRlcygpICsgMSk7XG4gIHRoaXMuc2V0U2Vjb25kcygwKTtcbn07XG5cbi8qKlxuICogSW5jcmVtZW50IHNlY29uZFxuICovXG5EYXRlLnByb3RvdHlwZS5hZGRTZWNvbmQgPSBmdW5jdGlvbiBhZGRTZWNvbmQgKCkge1xuICB0aGlzLnNldFNlY29uZHModGhpcy5nZXRTZWNvbmRzKCkgKyAxKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIExvYWQgRGF0ZSBjbGFzcyBleHRlbnNpb25zXG5yZXF1aXJlKCcuL2RhdGUnKTtcblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSBuZXcgZXhwcmVzc2lvbiBwYXJzZXJcbiAqXG4gKiBPcHRpb25zOlxuICogICBjdXJyZW50RGF0ZTogaXRlcmF0b3Igc3RhcnQgZGF0ZVxuICogICBlbmREYXRlOiBpdGVyYXRvciBlbmQgZGF0ZVxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBmaWVsZHMgIEV4cHJlc3Npb24gZmllbGRzIHBhcnNlZCB2YWx1ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFBhcnNlciBvcHRpb25zXG4gKi9cbmZ1bmN0aW9uIENyb25FeHByZXNzaW9uIChmaWVsZHMsIG9wdGlvbnMpIHtcbiAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMuX2N1cnJlbnREYXRlID0gbmV3IERhdGUob3B0aW9ucy5jdXJyZW50RGF0ZSk7XG4gIHRoaXMuX2VuZERhdGUgPSBvcHRpb25zLmVuZERhdGUgPyBuZXcgRGF0ZShvcHRpb25zLmVuZERhdGUpIDogbnVsbDtcbiAgdGhpcy5fZmllbGRzID0ge307XG5cbiAgLy8gTWFwIGZpZWxkc1xuICBmb3IgKHZhciBpID0gMCwgYyA9IENyb25FeHByZXNzaW9uLm1hcC5sZW5ndGg7IGkgPCBjOyBpKyspIHtcbiAgICB2YXIga2V5ID0gQ3JvbkV4cHJlc3Npb24ubWFwW2ldO1xuICAgIHRoaXMuX2ZpZWxkc1trZXldID0gZmllbGRzW2ldO1xuICB9XG59XG5cbi8qKlxuICogRmllbGQgbWFwcGluZ3NcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuQ3JvbkV4cHJlc3Npb24ubWFwID0gWyAnc2Vjb25kJywgJ21pbnV0ZScsICdob3VyJywgJ2RheU9mTW9udGgnLCAnbW9udGgnLCAnZGF5T2ZXZWVrJyBdO1xuXG4vKipcbiAqIFByZWZpbmVkIGludGVydmFsc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuQ3JvbkV4cHJlc3Npb24ucHJlZGVmaW5lZCA9IHtcbiAgJ0B5ZWFybHknOiAnMCAwIDEgMSAqJyxcbiAgJ0Btb250aGx5JzogJzAgMCAxICogKicsXG4gICdAd2Vla2x5JzogJzAgMCAqICogMCcsXG4gICdAZGFpbHknOiAnMCAwICogKiAqJyxcbiAgJ0Bob3VybHknOiAnMCAqICogKiAqJ1xufTtcblxuLyoqXG4gKiBGaWVsZHMgY29uc3RyYWludHNcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xuQ3JvbkV4cHJlc3Npb24uY29uc3RyYWludHMgPSBbXG4gIFsgMCwgNTkgXSwgLy8gU2Vjb25kXG4gIFsgMCwgNTkgXSwgLy8gTWludXRlXG4gIFsgMCwgMjMgXSwgLy8gSG91clxuICBbIDEsIDMxIF0sIC8vIERheSBvZiBtb250aFxuICBbIDEsIDEyIF0sIC8vIE1vbnRoXG4gIFsgMCwgNyBdIC8vIERheSBvZiB3ZWVrXG5dO1xuXG4vKipcbiAqIERheXMgaW4gbW9udGhcbiAqIEB0eXBlIHtudW1iZXJbXX1cbiAqL1xuQ3JvbkV4cHJlc3Npb24uZGF5c0luTW9udGggPSBbXG4gIDMxLFxuICAyOCxcbiAgMzEsXG4gIDMwLFxuICAzMSxcbiAgMzAsXG4gIDMxLFxuICAzMSxcbiAgMzAsXG4gIDMxLFxuICAzMCxcbiAgMzFcbl07XG5cbi8qKlxuICogRmllbGQgYWxpYXNlc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuQ3JvbkV4cHJlc3Npb24uYWxpYXNlcyA9IHtcbiAgbW9udGg6IHtcbiAgICBqYW46IDEsXG4gICAgZmViOiAyLFxuICAgIG1hcjogMyxcbiAgICBhcHI6IDQsXG4gICAgbWF5OiA1LFxuICAgIGp1bjogNixcbiAgICBqdWw6IDcsXG4gICAgYXVnOiA4LFxuICAgIHNlcDogOSxcbiAgICBvY3Q6IDEwLFxuICAgIG5vdjogMTEsXG4gICAgZGVjOiAxMlxuICB9LFxuXG4gIGRheU9mV2Vlazoge1xuICAgIHN1bjogMCxcbiAgICBtb246IDEsXG4gICAgdHVlOiAyLFxuICAgIHdlZDogMyxcbiAgICB0aHU6IDQsXG4gICAgZnJpOiA1LFxuICAgIHNhdDogNlxuICB9XG59O1xuXG4vKipcbiAqIEZpZWxkIGRlZmF1bHRzXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbkNyb25FeHByZXNzaW9uLnBhcnNlRGVmYXVsdHMgPSBbICcwJywgJyonLCAnKicsICcqJywgJyonLCAnKicgXTtcblxuLyoqXG4gKiBQYXJzZSBpbnB1dCBpbnRlcnZhbFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZCBGaWVsZCBzeW1ib2xpYyBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgRmllbGQgdmFsdWVcbiAqIEBwYXJhbSB7QXJyYXl9IGNvbnN0cmFpbnRzIFJhbmdlIHVwcGVyIGFuZCBsb3dlciBjb25zdHJhaW50c1xuICogQHJldHVybiB7QXJyYXl9IFNlcXVlbmNlIG9mIHNvcnRlZCB2YWx1ZXNcbiAqIEBwcml2YXRlXG4gKi9cbkNyb25FeHByZXNzaW9uLl9wYXJzZUZpZWxkID0gZnVuY3Rpb24gX3BhcnNlRmllbGQgKGZpZWxkLCB2YWx1ZSwgY29uc3RyYWludHMpIHtcbiAgLy8gUmVwbGFjZSBhbGlhc2VzXG4gIHN3aXRjaCAoZmllbGQpIHtcbiAgICBjYXNlICdtb250aCc6XG4gICAgY2FzZSAnZGF5T2ZXZWVrJzpcbiAgICAgIHZhciBhbGlhc2VzID0gQ3JvbkV4cHJlc3Npb24uYWxpYXNlc1tmaWVsZF07XG5cbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW2Etel17MSwzfS9naSwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgbWF0Y2ggPSBtYXRjaC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIGlmIChhbGlhc2VzW21hdGNoXSkge1xuICAgICAgICAgIHJldHVybiBhbGlhc2VzW21hdGNoXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZXNvbHZlIGFsaWFzIFwiJyArIG1hdGNoICsgJ1wiJylcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIC8vIENoZWNrIGZvciB2YWxpZCBjaGFyYWN0ZXJzLlxuICBpZiAoISgvXltcXGR8L3wqfFxcLXwsXSskLy50ZXN0KHZhbHVlKSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVycywgZ290IHZhbHVlOiAnICsgdmFsdWUpXG4gIH1cblxuICAvLyBSZXBsYWNlICcqJ1xuICBpZiAodmFsdWUuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFwqL2csIGNvbnN0cmFpbnRzLmpvaW4oJy0nKSk7XG4gIH1cblxuICAvL1xuICAvLyBJbmxpbmUgcGFyc2luZyBmdW5jdGlvbnNcbiAgLy9cbiAgLy8gUGFyc2VyIHBhdGg6XG4gIC8vICAtIHBhcnNlU2VxdWVuY2VcbiAgLy8gICAgLSBwYXJzZVJlcGVhdFxuICAvLyAgICAgIC0gcGFyc2VSYW5nZVxuXG4gIC8qKlxuICAgKiBQYXJzZSBzZXF1ZW5jZVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VTZXF1ZW5jZSAodmFsKSB7XG4gICAgdmFyIHN0YWNrID0gW107XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVSZXN1bHQgKHJlc3VsdCkge1xuICAgICAgdmFyIG1heCA9IHN0YWNrLmxlbmd0aCA+IDAgPyBNYXRoLm1heC5hcHBseShNYXRoLCBzdGFjaykgOiAtMTtcblxuICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIEFycmF5KSB7IC8vIE1ha2Ugc2VxdWVuY2UgbGluZWFyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBjID0gcmVzdWx0Lmxlbmd0aDsgaSA8IGM7IGkrKykge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdFtpXTtcblxuICAgICAgICAgIC8vIENoZWNrIGNvbnN0cmFpbnRzXG4gICAgICAgICAgaWYgKHZhbHVlIDwgY29uc3RyYWludHNbMF0gfHwgdmFsdWUgPiBjb25zdHJhaW50c1sxXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICdDb25zdHJhaW50IGVycm9yLCBnb3QgdmFsdWUgJyArIHZhbHVlICsgJyBleHBlY3RlZCByYW5nZSAnICtcbiAgICAgICAgICAgICAgICBjb25zdHJhaW50c1swXSArICctJyArIGNvbnN0cmFpbnRzWzFdXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh2YWx1ZSA+IG1heCkge1xuICAgICAgICAgICAgc3RhY2sucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWF4ID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgc3RhY2spO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyBTY2FsYXIgdmFsdWVcbiAgICAgICAgcmVzdWx0ID0gK3Jlc3VsdDtcblxuICAgICAgICAvLyBDaGVjayBjb25zdHJhaW50c1xuICAgICAgICBpZiAocmVzdWx0IDwgY29uc3RyYWludHNbMF0gfHwgcmVzdWx0ID4gY29uc3RyYWludHNbMV0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnQ29uc3RyYWludCBlcnJvciwgZ290IHZhbHVlICcgKyByZXN1bHQgKyAnIGV4cGVjdGVkIHJhbmdlICcgK1xuICAgICAgICAgICAgY29uc3RyYWludHNbMF0gKyAnLScgKyBjb25zdHJhaW50c1sxXVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGQgPT0gJ2RheU9mV2VlaycpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQgJSA3O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdCA+IG1heCkge1xuICAgICAgICAgIHN0YWNrLnB1c2gocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBhdG9tcyA9IHZhbC5zcGxpdCgnLCcpO1xuICAgIGlmIChhdG9tcy5sZW5ndGggPiAxKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgYyA9IGF0b21zLmxlbmd0aDsgaSA8IGM7IGkrKykge1xuICAgICAgICBoYW5kbGVSZXN1bHQocGFyc2VSZXBlYXQoYXRvbXNbaV0pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlUmVzdWx0KHBhcnNlUmVwZWF0KHZhbCkpO1xuICAgIH1cblxuICAgIHJldHVybiBzdGFjaztcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSByZXBldGl0aW9uIGludGVydmFsXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZVJlcGVhdCAodmFsKSB7XG4gICAgdmFyIHJlcGVhdEludGVydmFsID0gMTtcbiAgICB2YXIgYXRvbXMgPSB2YWwuc3BsaXQoJy8nKTtcblxuICAgIGlmIChhdG9tcy5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gcGFyc2VSYW5nZShhdG9tc1swXSwgYXRvbXNbYXRvbXMubGVuZ3RoIC0gMV0pO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZVJhbmdlKHZhbCwgcmVwZWF0SW50ZXJ2YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIHJhbmdlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJlcGVhdEludGVydmFsIFJlcGV0aXRpb24gaW50ZXJ2YWxcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZVJhbmdlICh2YWwsIHJlcGVhdEludGVydmFsKSB7XG4gICAgdmFyIHN0YWNrID0gW107XG4gICAgdmFyIGF0b21zID0gdmFsLnNwbGl0KCctJyk7XG5cbiAgICBpZiAoYXRvbXMubGVuZ3RoID4gMSApIHtcbiAgICAgIC8vIEludmFsaWQgcmFuZ2UsIHJldHVybiB2YWx1ZVxuICAgICAgaWYgKGF0b21zLmxlbmd0aCA8IDIgfHwgIWF0b21zWzBdLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gK3ZhbDtcbiAgICAgIH1cblxuICAgICAgLy8gVmFsaWRhdGUgcmFuZ2VcbiAgICAgIHZhciBtaW4gPSArYXRvbXNbMF07XG4gICAgICB2YXIgbWF4ID0gK2F0b21zWzFdO1xuXG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKG1pbikgfHwgTnVtYmVyLmlzTmFOKG1heCkgfHxcbiAgICAgICAgICBtaW4gPCBjb25zdHJhaW50c1swXSB8fCBtYXggPiBjb25zdHJhaW50c1sxXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ0NvbnN0cmFpbnQgZXJyb3IsIGdvdCByYW5nZSAnICtcbiAgICAgICAgICBtaW4gKyAnLScgKyBtYXggK1xuICAgICAgICAgICcgZXhwZWN0ZWQgcmFuZ2UgJyArXG4gICAgICAgICAgY29uc3RyYWludHNbMF0gKyAnLScgKyBjb25zdHJhaW50c1sxXVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChtaW4gPj0gbWF4KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByYW5nZTogJyArIHZhbCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSByYW5nZVxuICAgICAgdmFyIHJlcGVhdEluZGV4ID0gcmVwZWF0SW50ZXJ2YWw7XG5cbiAgICAgIGZvciAodmFyIGluZGV4ID0gbWluLCBjb3VudCA9IG1heDsgaW5kZXggPD0gY291bnQ7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKHJlcGVhdEluZGV4ID4gMCAmJiAocmVwZWF0SW5kZXggJSByZXBlYXRJbnRlcnZhbCkgPT09IDApIHtcbiAgICAgICAgICByZXBlYXRJbmRleCA9IDE7XG4gICAgICAgICAgc3RhY2sucHVzaChpbmRleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVwZWF0SW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfVxuXG4gICAgcmV0dXJuICt2YWw7XG4gIH1cblxuICByZXR1cm4gcGFyc2VTZXF1ZW5jZSh2YWx1ZSk7XG59O1xuXG4vKipcbiAqIEZpbmQgbmV4dCBtYXRjaGluZyBzY2hlZHVsZSBkYXRlXG4gKlxuICogQHJldHVybiB7RGF0ZX1cbiAqIEBwcml2YXRlXG4gKi9cbkNyb25FeHByZXNzaW9uLnByb3RvdHlwZS5fZmluZFNjaGVkdWxlID0gZnVuY3Rpb24gX2ZpbmRTY2hlZHVsZSAoKSB7XG4gIC8qKlxuICAgKiBNYXRjaCBmaWVsZCB2YWx1ZVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICogQHBhcmFtIHtBcnJheX0gc2VxdWVuY2VcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIG1hdGNoU2NoZWR1bGUgKHZhbHVlLCBzZXF1ZW5jZSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBjID0gc2VxdWVuY2UubGVuZ3RoOyBpIDwgYzsgaSsrKSB7XG4gICAgICBpZiAoc2VxdWVuY2VbaV0gPj0gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHNlcXVlbmNlW2ldID09PSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VxdWVuY2VbMF0gPT09IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVjdCBpZiBpbnB1dCByYW5nZSBmdWxseSBtYXRjaGVzIGNvbnN0cmFpbnQgYm91bmRzXG4gICAqIEBwYXJhbSB7QXJyYXl9IHJhbmdlIElucHV0IHJhbmdlXG4gICAqIEBwYXJhbSB7QXJyYXl9IGNvbnN0cmFpbnRzIElucHV0IGNvbnN0cmFpbnRzXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gaXNXaWxkY2FyZFJhbmdlIChyYW5nZSwgY29uc3RyYWludHMpIHtcbiAgICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBBcnJheSAmJiAhcmFuZ2UubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGNvbnN0cmFpbnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZS5sZW5ndGggPT09IChjb25zdHJhaW50c1sxXSAtIChjb25zdHJhaW50c1swXSA8IDEgPyAtIDEgOiAwKSk7XG4gIH1cblxuICB2YXIgY3VycmVudERhdGUgPSBuZXcgRGF0ZSh0aGlzLl9jdXJyZW50RGF0ZSk7XG4gIHZhciBlbmREYXRlID0gdGhpcy5fZW5kRGF0ZTtcblxuICAvLyBBcHBlbmQgbWludXRlIGlmIHNlY29uZCBpcyAwXG4gIGlmICh0aGlzLl9maWVsZHMuc2Vjb25kWzBdID09PSAwKSB7XG4gICAgY3VycmVudERhdGUuYWRkTWludXRlKCk7XG4gIH1cblxuICAvLyBGaW5kIG1hdGNoaW5nIHNjaGVkdWxlXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgLy8gVmFsaWRhdGUgdGltZXNwYW5cbiAgICBpZiAoZW5kRGF0ZSAmJiAoZW5kRGF0ZS5nZXRUaW1lKCkgLSBjdXJyZW50RGF0ZS5nZXRUaW1lKCkpIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdPdXQgb2YgdGhlIHRpbWVzcGFuIHJhbmdlJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIERheSBvZiBtb250aCBhbmQgd2VlayBtYXRjaGluZzpcbiAgICAvL1xuICAgIC8vIFwiVGhlIGRheSBvZiBhIGNvbW1hbmQncyBleGVjdXRpb24gY2FuIGJlIHNwZWNpZmllZCBieSB0d28gZmllbGRzIC0tXG4gICAgLy8gZGF5IG9mIG1vbnRoLCBhbmQgZGF5IG9mIHdlZWsuICBJZiAgYm90aFx0IGZpZWxkc1x0IGFyZSAgcmVzdHJpY3RlZCAgKGllLFxuICAgIC8vIGFyZW4ndCAgKiksICB0aGUgY29tbWFuZCB3aWxsIGJlIHJ1biB3aGVuIGVpdGhlciBmaWVsZCBtYXRjaGVzIHRoZSBjdXItXG4gICAgLy8gcmVudCB0aW1lLiAgRm9yIGV4YW1wbGUsIFwiMzAgNCAxLDE1ICogNVwiIHdvdWxkIGNhdXNlIGEgY29tbWFuZCB0byBiZVxuICAgIC8vIHJ1biBhdCA0OjMwIGFtIG9uIHRoZSAgMXN0IGFuZCAxNXRoIG9mIGVhY2ggbW9udGgsIHBsdXMgZXZlcnkgRnJpZGF5LlwiXG4gICAgLy9cbiAgICAvLyBodHRwOi8vdW5peGhlbHAuZWQuYWMudWsvQ0dJL21hbi1jZ2k/Y3JvbnRhYis1XG4gICAgLy9cblxuICAgIHZhciBkYXlPZk1vbnRoTWF0Y2ggPSBtYXRjaFNjaGVkdWxlKGN1cnJlbnREYXRlLmdldERhdGUoKSwgdGhpcy5fZmllbGRzLmRheU9mTW9udGgpO1xuICAgIHZhciBkYXlPZldlZWtNYXRjaCA9IG1hdGNoU2NoZWR1bGUoY3VycmVudERhdGUuZ2V0RGF5KCksIHRoaXMuX2ZpZWxkcy5kYXlPZldlZWspO1xuXG4gICAgdmFyIGlzRGF5T2ZNb250aFdpbGRjYXJkTWF0Y2ggPSBpc1dpbGRjYXJkUmFuZ2UodGhpcy5fZmllbGRzLmRheU9mTW9udGgsIENyb25FeHByZXNzaW9uLmNvbnN0cmFpbnRzWzNdKTtcbiAgICB2YXIgaXNNb250aFdpbGRjYXJkTWF0Y2ggPSBpc1dpbGRjYXJkUmFuZ2UodGhpcy5fZmllbGRzLmRheU9mV2VlaywgQ3JvbkV4cHJlc3Npb24uY29uc3RyYWludHNbNF0pO1xuICAgIHZhciBpc0RheU9mV2Vla1dpbGRjYXJkTWF0Y2ggPSBpc1dpbGRjYXJkUmFuZ2UodGhpcy5fZmllbGRzLmRheU9mV2VlaywgQ3JvbkV4cHJlc3Npb24uY29uc3RyYWludHNbNV0pO1xuXG4gICAgLy8gVmFsaWRhdGUgZGF5cyBpbiBtb250aCBpZiBleHBsaWNpdCB2YWx1ZSBpcyBnaXZlblxuICAgIGlmICghaXNNb250aFdpbGRjYXJkTWF0Y2gpIHtcbiAgICAgIHZhciBjdXJyZW50WWVhciA9IGN1cnJlbnREYXRlLmdldFllYXIoKTtcbiAgICAgIHZhciBjdXJyZW50TW9udGggPSBjdXJyZW50RGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgIHZhciBwcmV2aW91c01vbnRoID0gY3VycmVudE1vbnRoID09PSAxID8gMTEgOiBjdXJyZW50TW9udGggLSAxO1xuICAgICAgdmFyIGRheXNJblByZXZpb3VzTW9udGggPSBDcm9uRXhwcmVzc2lvbi5kYXlzSW5Nb250aFtwcmV2aW91c01vbnRoIC0gMV07XG4gICAgICB2YXIgZGF5c09mTW9udFJhbmdlTWF4ID0gdGhpcy5fZmllbGRzLmRheU9mTW9udGhbdGhpcy5fZmllbGRzLmRheU9mTW9udGgubGVuZ3RoIC0gMV07XG5cbiAgICAgIC8vIEhhbmRsZSBsZWFwIHllYXJcbiAgICAgIHZhciBpc0xlYXAgPSAhKChjdXJyZW50WWVhciAlIDQpIHx8ICghKGN1cnJlbnRZZWFyICUgMTAwKSAmJiAoY3VycmVudFllYXIgJSA0MDApKSk7XG4gICAgICBpZiAoaXNMZWFwKSB7XG4gICAgICAgIGRheXNJblByZXZpb3VzTW9udGggPSAyOTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2ZpZWxkcy5tb250aFswXSA9PT0gcHJldmlvdXNNb250aCAmJiBkYXlzSW5QcmV2aW91c01vbnRoIDwgZGF5c09mTW9udFJhbmdlTWF4KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBleHBsaWNpdCBkYXkgb2YgbW9udGggZGVmaW5pdGlvbicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBkYXkgaWYgbm90IGRheSBvZiBtb250aCBpcyBzZXQgKGFuZCBubyBtYXRjaCkgYW5kIGRheSBvZiB3ZWVrIGlzIHdpbGRjYXJkXG4gICAgaWYgKCFpc0RheU9mTW9udGhXaWxkY2FyZE1hdGNoICYmIGlzRGF5T2ZXZWVrV2lsZGNhcmRNYXRjaCAmJiAhZGF5T2ZNb250aE1hdGNoKSB7XG4gICAgICBjdXJyZW50RGF0ZS5hZGREYXkoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIEFkZCBkYXkgaWYgbm90IGRheSBvZiB3ZWVrIGlzIHNldCAoYW5kIG5vIG1hdGNoKSBhbmQgZGF5IG9mIG1vbnRoIGlzIHdpbGRjYXJkXG4gICAgaWYgKGlzRGF5T2ZNb250aFdpbGRjYXJkTWF0Y2ggJiYgIWlzRGF5T2ZXZWVrV2lsZGNhcmRNYXRjaCAmJiAhZGF5T2ZXZWVrTWF0Y2gpIHtcbiAgICAgIGN1cnJlbnREYXRlLmFkZERheSgpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gQWRkIGRheSBpZiBkYXkgb2YgbW9udCBhbmQgd2VlayBhcmUgbm9uLXdpbGRjYXJkIHZhbHVlcyBhbmQgYm90aCBkb2Vzbid0IG1hdGNoXG4gICAgaWYgKCEoaXNEYXlPZk1vbnRoV2lsZGNhcmRNYXRjaCAmJiBpc0RheU9mV2Vla1dpbGRjYXJkTWF0Y2gpICYmXG4gICAgICAgICFkYXlPZk1vbnRoTWF0Y2ggJiYgIWRheU9mV2Vla01hdGNoKSB7XG4gICAgICBjdXJyZW50RGF0ZS5hZGREYXkoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIE1hdGNoIG1vbnRoXG4gICAgaWYgKCFtYXRjaFNjaGVkdWxlKGN1cnJlbnREYXRlLmdldE1vbnRoKCkgKyAxLCB0aGlzLl9maWVsZHMubW9udGgpKSB7XG4gICAgICBjdXJyZW50RGF0ZS5hZGRNb250aCgpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2ggaG91clxuICAgIGlmICghbWF0Y2hTY2hlZHVsZShjdXJyZW50RGF0ZS5nZXRIb3VycygpLCB0aGlzLl9maWVsZHMuaG91cikpIHtcbiAgICAgIGN1cnJlbnREYXRlLmFkZEhvdXIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIE1hdGNoIG1pbnV0ZVxuICAgIGlmICghbWF0Y2hTY2hlZHVsZShjdXJyZW50RGF0ZS5nZXRNaW51dGVzKCksIHRoaXMuX2ZpZWxkcy5taW51dGUpKSB7XG4gICAgICBjdXJyZW50RGF0ZS5hZGRNaW51dGUoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIE1hdGNoIHNlY29uZFxuICAgIGlmICghbWF0Y2hTY2hlZHVsZShjdXJyZW50RGF0ZS5nZXRTZWNvbmRzKCksIHRoaXMuX2ZpZWxkcy5zZWNvbmQpKSB7XG4gICAgICBjdXJyZW50RGF0ZS5hZGRTZWNvbmQoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiAodGhpcy5fY3VycmVudERhdGUgPSBjdXJyZW50RGF0ZSk7XG59O1xuXG4vKipcbiAqIEZpbmQgbmV4dCBzdWl0YWJsZSBkYXRlXG4gKlxuICogQHB1YmxpY1xuICogQHJldHVybiB7RGF0ZX1cbiAqL1xuQ3JvbkV4cHJlc3Npb24ucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiBuZXh0ICgpIHtcbiAgcmV0dXJuIHRoaXMuX2ZpbmRTY2hlZHVsZSgpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBuZXh0IHN1aXRhYmxlIGRhdGUgZXhpc3RzXG4gKlxuICogQHB1YmxpY1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuQ3JvbkV4cHJlc3Npb24ucHJvdG90eXBlLmhhc05leHQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLl9jdXJyZW50RGF0ZTtcblxuICB0cnkge1xuICAgIHRoaXMubmV4dCgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZmluYWxseSB7XG4gICAgdGhpcy5fY3VycmVudERhdGUgPSBjdXJyZW50O1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBleHByZXNzaW9uIGl0ZXJhdG9yXG4gKlxuICogQHB1YmxpY1xuICogQHBhcmFtIHtOdW1iZXJ9IHN0ZXBzIE51bWJlcnMgb2Ygc3RlcHMgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgT3B0aW9uYWwgY2FsbGJhY2tcbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBvZiB0aGUgaXRlcmF0ZWQgcmVzdWx0c1xuICovXG5Dcm9uRXhwcmVzc2lvbi5wcm90b3R5cGUuaXRlcmF0ZSA9IGZ1bmN0aW9uIGl0ZXJhdGUgKHN0ZXBzLCBjYWxsYmFjaykge1xuICB2YXIgZGF0ZXMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMCwgYyA9IHN0ZXBzOyBpIDwgYzsgaSsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBpdGVtID0gdGhpcy5uZXh0KCk7XG4gICAgICBkYXRlcy5wdXNoKGl0ZW0pO1xuXG4gICAgICAvLyBGaXJlIHRoZSBjYWxsYmFja1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKGl0ZW0sIGkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRhdGVzO1xufTtcblxuLyoqXG4gKiBSZXNldCBleHByZXNzaW9uIGl0ZXJhdG9yIHN0YXRlXG4gKlxuICogQHB1YmxpY1xuICovXG5Dcm9uRXhwcmVzc2lvbi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiByZXNldCAoKSB7XG4gIHRoaXMuX2N1cnJlbnREYXRlID0gbmV3IERhdGUodGhpcy5fb3B0aW9ucy5jdXJyZW50RGF0ZSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIGlucHV0IGV4cHJlc3Npb24gKGFzeW5jKVxuICpcbiAqIEBwdWJsaWNcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHByZXNzaW9uIElucHV0IGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUGFyc2luZyBvcHRpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5Dcm9uRXhwcmVzc2lvbi5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlIChleHByZXNzaW9uLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2UgKGV4cHJlc3Npb24sIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMuY3VycmVudERhdGUpIHtcbiAgICAgIG9wdGlvbnMuY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIH1cblxuICAgIC8vIElzIGlucHV0IGV4cHJlc3Npb24gcHJlZGVmaW5lZD9cbiAgICBpZiAoQ3JvbkV4cHJlc3Npb24ucHJlZGVmaW5lZFtleHByZXNzaW9uXSkge1xuICAgICAgZXhwcmVzc2lvbiA9IENyb25FeHByZXNzaW9uLnByZWRlZmluZWRbZXhwcmVzc2lvbl07XG4gICAgfVxuXG4gICAgLy8gU3BsaXQgZmllbGRzXG4gICAgdmFyIGZpZWxkcyA9IFtdO1xuICAgIHZhciBhdG9tcyA9IGV4cHJlc3Npb24uc3BsaXQoJyAnKTtcblxuICAgIC8vIFJlc29sdmUgZmllbGRzXG4gICAgdmFyIHN0YXJ0ID0gKENyb25FeHByZXNzaW9uLm1hcC5sZW5ndGggLSBhdG9tcy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwLCBjID0gQ3JvbkV4cHJlc3Npb24ubWFwLmxlbmd0aDsgaSA8IGM7ICsraSkge1xuICAgICAgdmFyIGZpZWxkID0gQ3JvbkV4cHJlc3Npb24ubWFwW2ldOyAvLyBGaWVsZCBuYW1lXG4gICAgICB2YXIgdmFsdWUgPSBhdG9tc1thdG9tcy5sZW5ndGggPiBjID8gaSA6IGkgLSBzdGFydF07IC8vIEZpZWxkIHZhbHVlXG5cbiAgICAgIGlmIChpIDwgc3RhcnQgfHwgIXZhbHVlKSB7XG4gICAgICAgIGZpZWxkcy5wdXNoKENyb25FeHByZXNzaW9uLl9wYXJzZUZpZWxkKFxuICAgICAgICAgIGZpZWxkLFxuICAgICAgICAgIENyb25FeHByZXNzaW9uLnBhcnNlRGVmYXVsdHNbaV0sXG4gICAgICAgICAgQ3JvbkV4cHJlc3Npb24uY29uc3RyYWludHNbaV0pXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgeyAvLyBVc2UgZGVmYXVsdCB2YWx1ZVxuICAgICAgICBmaWVsZHMucHVzaChDcm9uRXhwcmVzc2lvbi5fcGFyc2VGaWVsZChcbiAgICAgICAgICBmaWVsZCxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBDcm9uRXhwcmVzc2lvbi5jb25zdHJhaW50c1tpXSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENyb25FeHByZXNzaW9uKGZpZWxkcywgb3B0aW9ucyk7XG4gIH1cblxuICAvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5ICg8PSAwLjMuKilcbiAgLy8gV2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMC41XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHBhcnNlKGV4cHJlc3Npb24sIG9wdGlvbnMpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcGFyc2UoZXhwcmVzc2lvbiwgb3B0aW9ucyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvbkV4cHJlc3Npb247XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDcm9uRXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vZXhwcmVzc2lvbicpO1xuXG5mdW5jdGlvbiBDcm9uUGFyc2VyKCkge31cblxuLyoqXG4gKiBQYXJzZSBjcm9udGFiIGVudHJ5XG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBlbnRyeSBDcm9udGFiIGZpbGUgZW50cnkvbGluZVxuICovXG5Dcm9uUGFyc2VyLl9wYXJzZUVudHJ5ID0gZnVuY3Rpb24gX3BhcnNlRW50cnkgKGVudHJ5KSB7XG4gIHZhciBhdG9tcyA9IGVudHJ5LnNwbGl0KCcgJyk7XG5cbiAgaWYgKGF0b21zLmxlbmd0aCA9PT0gNikge1xuICAgIHJldHVybiB7XG4gICAgICBpbnRlcnZhbDogQ3JvbkV4cHJlc3Npb24ucGFyc2UoZW50cnkpXG4gICAgfTtcbiAgfSBlbHNlIGlmIChhdG9tcy5sZW5ndGggPiA2KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGludGVydmFsOiBDcm9uRXhwcmVzc2lvbi5wYXJzZShlbnRyeSksXG4gICAgICBjb21tYW5kOiBhdG9tcy5zbGljZSg2LCBhdG9tcy5sZW5ndGgpXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZW50cnk6ICcgKyBlbnRyeSk7XG4gIH1cbn07XG5cbi8qKlxuICogV3JhcHBlciBmb3IgQ3JvbkV4cHJlc3Npb24ucGFyc2VyIG1ldGhvZFxuICpcbiAqIEBwdWJsaWNcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHByZXNzaW9uIElucHV0IGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUGFyc2luZyBvcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkNyb25QYXJzZXIucGFyc2VFeHByZXNzaW9uID0gZnVuY3Rpb24gcGFyc2VFeHByZXNzaW9uIChleHByZXNzaW9uLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICByZXR1cm4gQ3JvbkV4cHJlc3Npb24ucGFyc2UoZXhwcmVzc2lvbiwgb3B0aW9ucywgY2FsbGJhY2spO1xufTtcblxuXG4vKipcbiAqIFdyYXBwZXIgZm9yIENyb25FeHByZXNzaW9uLnBhcnNlclN5bmMgbWV0aG9kXG4gKlxuICogQHB1YmxpY1xuICogQGRlcHJlY2F0ZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHByZXNzaW9uIElucHV0IGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUGFyc2luZyBvcHRpb25zXG4gKi9cbkNyb25QYXJzZXIucGFyc2VFeHByZXNzaW9uU3luYyA9IENyb25QYXJzZXIucGFyc2VFeHByZXNzaW9uO1xuXG4vKipcbiAqIFBhcnNlIGNvbnRlbnQgc3RyaW5nXG4gKlxuICogQHB1YmxpY1xuICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgQ3JvbnRhYiBjb250ZW50XG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkNyb25QYXJzZXIucGFyc2VTdHJpbmcgPSBmdW5jdGlvbiBwYXJzZVN0cmluZyAoZGF0YSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBibG9ja3MgPSBkYXRhLnNwbGl0KCdcXG4nKTtcblxuICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgdmFyaWFibGVzOiB7fSxcbiAgICBleHByZXNzaW9uczogW10sXG4gICAgZXJyb3JzOiB7fVxuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwLCBjID0gYmxvY2tzLmxlbmd0aDsgaSA8IGM7IGkrKykge1xuICAgIHZhciBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICB2YXIgbWF0Y2hlcyA9IG51bGw7XG4gICAgdmFyIGVudHJ5ID0gYmxvY2sucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpOyAvLyBSZW1vdmUgc3Vycm91bmRpbmcgc3BhY2VzXG5cbiAgICBpZiAoZW50cnkubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKGVudHJ5Lm1hdGNoKC9eIy8pKSB7IC8vIENvbW1lbnRcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKChtYXRjaGVzID0gZW50cnkubWF0Y2goL14oLiopPSguKikkLykpKSB7IC8vIFZhcmlhYmxlXG4gICAgICAgIHJlc3BvbnNlLnZhcmlhYmxlc1ttYXRjaGVzWzFdXSA9IG1hdGNoZXNbMl07XG4gICAgICB9IGVsc2UgeyAvLyBFeHByZXNzaW9uP1xuICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IHNlbGYuX3BhcnNlRW50cnkoJzAgJyArIGVudHJ5KTtcbiAgICAgICAgICByZXNwb25zZS5leHByZXNzaW9ucy5wdXNoKHJlc3VsdC5pbnRlcnZhbCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJlc3BvbnNlLmVycm9yc1tlbnRyeV0gPSBlcnI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2U7XG59O1xuXG4vKipcbiAqIFBhcnNlIGNyb250YWIgZmlsZVxuICpcbiAqIEBwdWJsaWNcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlUGF0aCBQYXRoIHRvIGZpbGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cbkNyb25QYXJzZXIucGFyc2VGaWxlID0gZnVuY3Rpb24gcGFyc2VGaWxlIChmaWxlUGF0aCwgY2FsbGJhY2spIHtcbiAgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZShmaWxlUGF0aCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgQ3JvblBhcnNlci5wYXJzZVN0cmluZyhkYXRhLnRvU3RyaW5nKCkpKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb25QYXJzZXI7XG4iLG51bGxdfQ==
