(function(root, factory){

  var CronParser = factory();

  if (typeof module !== 'undefined' && module.exports){
    module.exports = CronParser;
  }

  if (typeof window !== 'undefined' && this === window){
    window.CronParser = CronParser;
  }

}(this, function(){
  
  // source ./date.js
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
    this.setDate(this.getDate() + 1);
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
  };
  
  /**
   * Increment hour
   */
  Date.prototype.addHour = function addHour () {
    this.setHours(this.getHours() + 1);
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
  
  // end:source ./date.js
  // source ./expression.js
  var CronExpression;
  (function(){
  'use strict';
  
  
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
  CronExpression = function (fields, options) {
    this._options = options;
    this._currentDate = new Date(options.currentDate.toUTCString());
    this._endDate = options.endDate ? new Date(options.endDate.toUTCString()) : null;
    this._fields = {};
  
    // Map fields
    for (var i = 0, c = CronExpression.map.length; i < c; i++) {
      var key = CronExpression.map[i];
      this._fields[key] = fields[i];
    }
  };
  
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
  
    //Check for valid characters.
    if (!CronExpression._validateCharacters(value)){
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
     * @param {String} val
     * @return {Array}
     * @private
     */
    function parseSequence (val) {
      var stack = [];
  
      function handleResult (result) {
        var max = stack.length > 0 ? Math.max.apply(Math, stack) : -1;
  
        if (result instanceof Array) { // Make sequence linear
          result.forEach(function (value) {
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
          });
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
     * @param {String} val
     * @return {Array}
     */
    function parseRepeat (val) {
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
     * @param {String} val
     * @param {Number} repeatInterval Repetition interval
     * @return {Array}
     * @private
     */
    function parseRange (val, repeatInterval) {
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
  
  /**
   * Detect if input range fully matches constraint bounds
   * @param {Array} range Input range
   * @param {Array} constraints Input constraints
   * @returns {Boolean}
   * @private
   */
  CronExpression._isWildcardRange = function _isWildcardRange (range, constraints) {
    if (!(range instanceof Array)) {
      return false;
    }
  
    if (constraints.length !== 2) {
      return false;
    }
  
    return range.length === (constraints[1] - (constraints[0] < 1 ? - 1 : 0));
  };
  
  /**
   * Match field value
   *
   * @param {String} value
   * @param {Array} sequence
   * @return {Boolean}
   * @private
   */
  CronExpression._matchSchedule = function matchSchedule (value, sequence) {
    for (var i = 0, c = sequence.length; i < c; i++) {
      if (sequence[i] >= value) {
        return sequence[i] === value;
      }
    }
  
    return sequence[0] === value;
  };
  
  /**
   * Validate expression allowed characters
   *
   * @param {String} value Input expression
   * @returns {Boolean}
   * @private
   */
  CronExpression._validateCharacters = function _validateCharacters (value) {
    var regex = new RegExp('^[\\d|/|*|\\-|,]+$');
    return regex.test(value);
  };
  
  /**
   * Constraint validation
   *
   * @private
   * @static
   * @param {Object} value alue to check
   * @return {Boolean} True if validation succeeds, false if not
   */
  CronExpression._validateConstraint = function _validateConstraint (value, constraints) {
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
   * @param {Date} current Current date
   * @param {Date} end End date
   * @return {Boolean} Return true if timespan is still valid, otherwise return false
   */
  CronExpression._validateTimespan = function _validateTimespan (current, end) {
    if (end && (end.getTime() - current.getTime()) < 0) {
      return false;
    }
  
    return true;
  };
  
  /**
   * Find next matching schedule date
   *
   * @return {Date}
   * @private
   */
  CronExpression.prototype._findSchedule = function _findSchedule () {
    // Validate timespan
    if (!CronExpression._validateTimespan(this._currentDate, this._endDate)) {
      throw new Error('Out of the timespan range');
    }
  
    var current = new Date(this._currentDate.toUTCString());
  
    // Reset
    if (this._fields.second.length === 1 && this._fields.second[0] === 0) {
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
      if (!CronExpression._matchSchedule(current.getMonth() + 1, this._fields.month)) {
        current.addMonth();
        continue;
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
  
      var dayOfMonthMatch = CronExpression._matchSchedule(current.getDate(), this._fields.dayOfMonth);
      var dayOfWeekMatch = CronExpression._matchSchedule(current.getDay(), this._fields.dayOfWeek);
      var isDayOfMonthWildcardMatch = CronExpression._isWildcardRange(this._fields.dayOfMonth, CronExpression.constraints[3]);
      var isDayOfWeekWildcardMatch = CronExpression._isWildcardRange(this._fields.dayOfWeek, CronExpression.constraints[5]);
  
      // Add day if not day of month is set (and no match) and day of week is wildcard
      if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !dayOfMonthMatch) {
        current.addDay();
        continue;
      }
  
      // Add day if not day of week is set (and no match) and day of month is wildcard
      if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !dayOfWeekMatch) {
        current.addDay();
        continue;
      }
  
      // Add day if day of mont and week are non-wildcard values and both doesn't match
      if (!(isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch) &&
          !dayOfMonthMatch && !dayOfWeekMatch) {
        current.addDay();
        continue;
      }
  
      // Match hour
      if (!CronExpression._matchSchedule(current.getHours(), this._fields.hour)) {
        current.addHour();
        continue;
      }
  
      // Match minute
      if (!CronExpression._matchSchedule(current.getMinutes(), this._fields.minute)) {
        current.addMinute();
        continue;
      }
  
      // Match second
      if (!CronExpression._matchSchedule(current.getSeconds(), this._fields.second)) {
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
    this._currentDate = new Date(this._options.currentDate.toUTCString());
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
  
  }());
  // end:source ./expression.js
  // source ./parser.js
  var CronParser;
  (function(){ 
  
  'use strict';
  
  CronParser = function () {};
  
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
  
  
  }());
  // end:source ./parser.js

  return CronParser;
}));