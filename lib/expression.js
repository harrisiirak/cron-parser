'use strict';

// Load Date class extensions
var CronDate = require('./date');

// Get Number.isNaN or the polyfill
var safeIsNaN = require('is-nan');

/**
 * Cron iteration loop safety limit
 */
var LOOP_LIMIT = 10000;

/**
 * Detect if input range fully matches constraint bounds
 * @param {Array} range Input range
 * @param {Array} constraints Input constraints
 * @returns {Boolean}
 * @private
 */
function isWildcardRange(range, constraints) {
  if (range instanceof Array && !range.length) {
    return false;
  }

  if (constraints.length !== 2) {
    return false;
  }

  return range.length === (constraints[1] - (constraints[0] < 1 ? - 1 : 0));
}

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
  this._utc = options.utc || false;
  this._tz = this._utc ? 'UTC' : options.tz;
  this._currentDate = new CronDate(options.currentDate, this._tz);
  this._startDate = options.startDate ? new CronDate(options.startDate, this._tz) : null;
  this._endDate = options.endDate ? new CronDate(options.endDate, this._tz) : null;
  this._isIterator = options.iterator || false;
  this._hasIterated = false;
  this._nthDayOfWeek = options.nthDayOfWeek || 0;
  this.fields = Object.freeze(fields);
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
  29,
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

CronExpression.standardValidCharacters = /^[\d|/|*|\-|,]+$/;
CronExpression.dayOfWeekValidCharacters = /^[\d|/|*|\-|,|\?]+$/;
CronExpression.dayOfMonthValidCharacters = /^[\d|L|/|*|\-|,|\?]+$/;
CronExpression.validCharacters = {
  second: CronExpression.standardValidCharacters,
  minute: CronExpression.standardValidCharacters,
  hour: CronExpression.standardValidCharacters,
  dayOfMonth: CronExpression.dayOfMonthValidCharacters,
  month: CronExpression.standardValidCharacters,
  dayOfWeek: CronExpression.dayOfWeekValidCharacters,
};

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

        if (typeof aliases[match] !== undefined) {
          return aliases[match];
        } else {
          throw new Error('Cannot resolve alias "' + match + '"');
        }
      });
      break;
  }

  // Check for valid characters.
  if (!(CronExpression.validCharacters[field].test(value))) {
    throw new Error('Invalid characters, got value: ' + value);
  }

  // Replace '*' and '?'
  if (value.indexOf('*') !== -1) {
    value = value.replace(/\*/g, constraints.join('-'));
  } else if (value.indexOf('?') !== -1) {
    value = value.replace(/\?/g, constraints.join('-'));
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

          stack.push(value);
        }
      } else { // Scalar value
        //TODO: handle the cases when there is a range and L, or list of dates and L
        if (field === 'dayOfMonth' && result === 'L') {
          stack.push(result);
          return;
        }

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

        stack.push(result);
      }
    }

    var atoms = val.split(',');
    if (!atoms.every(function (atom) {
      return atom.length > 0;
    })) {
      throw new Error('Invalid list value format');
    }

    if (atoms.length > 1) {
      for (var i = 0, c = atoms.length; i < c; i++) {
        handleResult(parseRepeat(atoms[i]));
      }
    } else {
      handleResult(parseRepeat(val));
    }

    stack.sort(function(a, b) {
      return a - b;
    });

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
      if (atoms[0] == +atoms[0]) {
        atoms = [atoms[0] + '-' + constraints[1], atoms[1]];
      }
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
      if (atoms.length < 2) {
        return +val;
      }

      if (!atoms[0].length) {
        if (!atoms[1].length) {
          throw new Error('Invalid range: ' + val);
        }

        return +val;
      }

      // Validate range
      var min = +atoms[0];
      var max = +atoms[1];

      if (safeIsNaN(min) || safeIsNaN(max) ||
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
      var repeatIndex = +repeatInterval;

      if (safeIsNaN(repeatIndex) || repeatIndex <= 0) {
        throw new Error('Constraint error, cannot repeat at every ' + repeatIndex + ' time.');
      }

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

    return isNaN(+val) ? val : +val;
  }

  return parseSequence(value);
};

CronExpression.prototype._applyTimezoneShift = function(currentDate, dateMathVerb, method) {
  if ((method === 'Month') || (method === 'Day')) {
    var prevTime = currentDate.getTime();
    currentDate[dateMathVerb + method]();
    var currTime = currentDate.getTime();
    if (prevTime === currTime) {
      // Jumped into a not existent date due to a DST transition
      if ((currentDate.getMinutes() === 0) &&
          (currentDate.getSeconds() === 0)) {
        currentDate.addHour();
      } else if ((currentDate.getMinutes() === 59) &&
                 (currentDate.getSeconds() === 59)) {
        currentDate.subtractHour();
      }
    }
  } else {
    var previousHour = currentDate.getHours();
    currentDate[dateMathVerb + method]();
    var currentHour = currentDate.getHours();
    var diff = currentHour - previousHour;
    if (diff === 2) {
        // Starting DST
        if (this.fields.hour.length !== 24) {
          // Hour is specified
          this._dstStart = currentHour;
        }
      } else if ((diff === 0) &&
                 (currentDate.getMinutes() === 0) &&
                 (currentDate.getSeconds() === 0)) {
        // Ending DST
        if (this.fields.hour.length !== 24) {
          // Hour is specified
          this._dstEnd = currentHour;
        }
      }
  }
};


/**
 * Find next or previous matching schedule date
 *
 * @return {CronDate}
 * @private
 */
CronExpression.prototype._findSchedule = function _findSchedule (reverse) {

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
   * Helps determine if the provided date is the correct nth occurence of the
   * desired day of week.
   *
   * @param {CronDate} date
   * @param {Number} nthDayOfWeek
   * @return {Boolean}
   * @private
   */
  function isNthDayMatch(date, nthDayOfWeek) {
    if (nthDayOfWeek < 6) {
      if (
        date.getDate() < 8 &&
        nthDayOfWeek === 1 // First occurence has to happen in first 7 days of the month
      ) {
        return true;
      }

      var offset = date.getDate() % 7 ? 1 : 0; // Math is off by 1 when dayOfWeek isn't divisible by 7
      var adjustedDate = date.getDate() - (date.getDate() % 7); // find the first occurance
      var occurrence = Math.floor(adjustedDate / 7) + offset;

      return occurrence === nthDayOfWeek;
    }

    return false;
  }

  /**
   * Helper function that checks if 'L' is in the array
   *
   * @param {Array} dayOfMonth
   */
  function isLInDayOfMonth(dayOfMonth) {
    return dayOfMonth.length > 0 && dayOfMonth.indexOf('L') >= 0;
  }

  // Whether to use backwards directionality when searching
  reverse = reverse || false;
  var dateMathVerb = reverse ? 'subtract' : 'add';

  var currentDate = new CronDate(this._currentDate, this._tz);
  var startDate = this._startDate;
  var endDate = this._endDate;

  // Find matching schedule
  var startTimestamp = currentDate.getTime();
  var stepCount = 0;

  while (stepCount < LOOP_LIMIT) {
    stepCount++;

    // Validate timespan
    if (reverse) {
      if (startDate && (currentDate.getTime() - startDate.getTime() < 0)) {
        throw new Error('Out of the timespan range');
      }
    } else {
      if (endDate && (endDate.getTime() - currentDate.getTime()) < 0) {
        throw new Error('Out of the timespan range');
      }
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

    var dayOfMonthMatch = matchSchedule(currentDate.getDate(), this.fields.dayOfMonth);
    if (isLInDayOfMonth(this.fields.dayOfMonth)) {
      dayOfMonthMatch = dayOfMonthMatch || currentDate.isLastDayOfMonth();
    }
    var dayOfWeekMatch = matchSchedule(currentDate.getDay(), this.fields.dayOfWeek);

    var isDayOfMonthWildcardMatch = isWildcardRange(this.fields.dayOfMonth, CronExpression.constraints[3]);
    var isDayOfWeekWildcardMatch = isWildcardRange(this.fields.dayOfWeek, CronExpression.constraints[5]);

    var currentHour = currentDate.getHours();

    // Add or subtract day if select day not match with month (according to calendar)
    if (!dayOfMonthMatch && !dayOfWeekMatch) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Day');
      continue;
    }

    // Add or subtract day if not day of month is set (and no match) and day of week is wildcard
    if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !dayOfMonthMatch) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Day');
      continue;
    }

    // Add or subtract day if not day of week is set (and no match) and day of month is wildcard
    if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !dayOfWeekMatch) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Day');
      continue;
    }

    // Add or subtract day if day of month and week are non-wildcard values and both doesn't match
    if (!(isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch) &&
        !dayOfMonthMatch && !dayOfWeekMatch) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Day');
      continue;
    }

    // Add or subtract day if day of week & nthDayOfWeek are set (and no match)
    if (
      this._nthDayOfWeek > 0 &&
      !isNthDayMatch(currentDate, this._nthDayOfWeek)
    ) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Day');
      continue;
    }

    // Match month
    if (!matchSchedule(currentDate.getMonth() + 1, this.fields.month)) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Month');
      continue;
    }

    // Match hour
    if (!matchSchedule(currentHour, this.fields.hour)) {
      if (this._dstStart !== currentHour) {
        this._dstStart = null;
        this._applyTimezoneShift(currentDate, dateMathVerb, 'Hour');
        continue;
      } else if (!matchSchedule(currentHour - 1, this.fields.hour)) {
        currentDate[dateMathVerb + 'Hour']();
        continue;
      }
    } else if (this._dstEnd === currentHour) {
      if (!reverse) {
        this._dstEnd = null;
        this._applyTimezoneShift(currentDate, 'add', 'Hour');
        continue;
      }
    }

    // Match minute
    if (!matchSchedule(currentDate.getMinutes(), this.fields.minute)) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Minute');
      continue;
    }

    // Match second
    if (!matchSchedule(currentDate.getSeconds(), this.fields.second)) {
      this._applyTimezoneShift(currentDate, dateMathVerb, 'Second');
      continue;
    }

    // Increase a second in case in the first iteration the currentDate was not
    // modified
    if (startTimestamp === currentDate.getTime()) {
      if ((dateMathVerb === 'add') || (currentDate.getMilliseconds() === 0)) {
        this._applyTimezoneShift(currentDate, dateMathVerb, 'Second');
      } else {
        currentDate.setMilliseconds(0);
      }

      continue;
    }

    break;
  }

  if (stepCount >= LOOP_LIMIT) {
    throw new Error('Invalid expression, loop limit exceeded');
  }

  this._currentDate = new CronDate(currentDate, this._tz);
  this._hasIterated = true;

  return currentDate;
};

/**
 * Find next suitable date
 *
 * @public
 * @return {CronDate|Object}
 */
CronExpression.prototype.next = function next () {
  var schedule = this._findSchedule();

  // Try to return ES6 compatible iterator
  if (this._isIterator) {
    return {
      value: schedule,
      done: !this.hasNext()
    };
  }

  return schedule;
};

/**
 * Find previous suitable date
 *
 * @public
 * @return {CronDate|Object}
 */
CronExpression.prototype.prev = function prev () {
  var schedule = this._findSchedule(true);

  // Try to return ES6 compatible iterator
  if (this._isIterator) {
    return {
      value: schedule,
      done: !this.hasPrev()
    };
  }

  return schedule;
};

/**
 * Check if next suitable date exists
 *
 * @public
 * @return {Boolean}
 */
CronExpression.prototype.hasNext = function() {
  var current = this._currentDate;
  var hasIterated = this._hasIterated;

  try {
    this._findSchedule();
    return true;
  } catch (err) {
    return false;
  } finally {
    this._currentDate = current;
    this._hasIterated = hasIterated;
  }
};

/**
 * Check if previous suitable date exists
 *
 * @public
 * @return {Boolean}
 */
CronExpression.prototype.hasPrev = function() {
  var current = this._currentDate;
  var hasIterated = this._hasIterated;

  try {
    this._findSchedule(true);
    return true;
  } catch (err) {
    return false;
  } finally {
    this._currentDate = current;
    this._hasIterated = hasIterated;
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

  if (steps >= 0) {
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
  } else {
    for (var i = 0, c = steps; i > c; i--) {
      try {
        var item = this.prev();
        dates.push(item);

        // Fire the callback
        if (callback) {
          callback(item, i);
        }
      } catch (err) {
        break;
      }
    }
  }

  return dates;
};

/**
 * Reset expression iterator state
 *
 * @public
 */
CronExpression.prototype.reset = function reset (newDate) {
  this._currentDate = new CronDate(newDate || this._options.currentDate);
};

/**
 * Parse input expression (async)
 *
 * @public
 * @param {String} expression Input expression
 * @param {Object} [options] Parsing options
 * @param {Function} [callback]
 */
CronExpression.parse = function parse(expression, options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  function parse (expression, options) {
    if (!options) {
      options = {};
    }

    if (typeof options.currentDate === 'undefined') {
      options.currentDate = new CronDate(undefined, self._tz);
    }

    // Is input expression predefined?
    if (CronExpression.predefined[expression]) {
      expression = CronExpression.predefined[expression];
    }

    // Split fields
    var fields = [];
    var atoms = (expression + '').trim().split(/\s+/);

    if (atoms.length > 6) {
      throw new Error('Invalid cron expression');
    }

    // Resolve fields
    var start = (CronExpression.map.length - atoms.length);
    for (var i = 0, c = CronExpression.map.length; i < c; ++i) {
      var field = CronExpression.map[i]; // Field name
      var value = atoms[atoms.length > c ? i : i - start]; // Field value

      if (i < start || !value) { // Use default value
        fields.push(CronExpression._parseField(
          field,
          CronExpression.parseDefaults[i],
          CronExpression.constraints[i])
        );
      } else {
        var val = field === 'dayOfWeek' ? parseNthDay(value) : value;

        fields.push(CronExpression._parseField(
          field,
          val,
          CronExpression.constraints[i])
        );
      }
    }

    var mappedFields = {};
    for (var i = 0, c = CronExpression.map.length; i < c; i++) {
      var key = CronExpression.map[i];
      mappedFields[key] = Object.freeze(fields[i]);
    }

    // Filter out any day of month value that is larger than given month expects
    if (mappedFields.month.length === 1) {
      var daysInMonth = CronExpression.daysInMonth[mappedFields.month[0] - 1];

      if (mappedFields.dayOfMonth[0] > daysInMonth) {
        throw new Error('Invalid explicit day of month definition');
      }

      mappedFields.dayOfMonth = mappedFields.dayOfMonth.filter(function(dayOfMonth) {
        return dayOfMonth === 'L' ? true : dayOfMonth <= daysInMonth;
      });
      //sort
      mappedFields.dayOfMonth.sort(function(a,b) {
        var aIsNumber = typeof a === 'number';
        var bIsNumber = typeof b === 'number';

        if (aIsNumber && bIsNumber) {
          return a - b;
        }

        if(!aIsNumber) {
          return 1;
        }

        return -1;
      });

    }

    return new CronExpression(mappedFields, options);

    /**
     * Parses out the # special character for the dayOfWeek field & adds it to options.
     *
     * @param {String} val
     * @return {String}
     * @private
     */
    function parseNthDay(val) {
      var atoms = val.split('#');
      if (atoms.length > 1) {
        var nthValue = +atoms[atoms.length - 1];
        if(/,/.test(val)) {
          throw new Error('Constraint error, invalid dayOfWeek `#` and `,` '
            + 'special characters are incompatible');
        }
        if(/\//.test(val)) {
          throw new Error('Constraint error, invalid dayOfWeek `#` and `/` '
            + 'special characters are incompatible');
        }
        if(/-/.test(val)) {
          throw new Error('Constraint error, invalid dayOfWeek `#` and `-` '
            + 'special characters are incompatible');
        }
        if (atoms.length > 2 || safeIsNaN(nthValue) || (nthValue < 1 || nthValue > 5)) {
          throw new Error('Constraint error, invalid dayOfWeek occurrence number (#)');
        }

        options.nthDayOfWeek = nthValue;
        return atoms[0];
      }
      return val;
    }
  }

  return parse(expression, options);
};

module.exports = CronExpression;
