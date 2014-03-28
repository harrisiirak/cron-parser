'use strict';

var CronExpression = require('./expression');

function CronParser() {

}

/**
 * Parse crontab entry
 *
 * @private
 * @param   {String}   entry    Crontab file entry/line
 * @param   {Function} callback
 */
CronParser._parseEntry = function(entry, callback) {
  var atoms = entry.split(' ');

  if (atoms.length === 6) {
    CronExpression.parse(entry, callback);
  } else if (atoms.length > 6) {
    CronExpression.parse(entry, function(err, interval) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, {
        interval: interval,
        command: atoms.slice(6, atoms.length)
      });
    });
  } else {
    callback(new Error('Invalid entry: ' + entry));
  }
};

/**
 * Wrapper for CronExpression.parser method
 *
 * @public
 * @param  {String}   expression   Input expression
 * @param  {Object}   [options]  Parsing options
 * @param  {Function} callback
 */
CronParser.parseExpression = function(expression, options, callback) {
  return CronExpression.parse(expression, options, callback);
};


/**
 * Wrapper for CronExpression.parserSync method
 *
 * @public
 * @param  {String}   expression   Input expression
 * @param  {Object}   [options]  Parsing options
 */
CronParser.parseExpressionSync = function(expression, options) {
  return CronExpression.parseSync(expression, options);
};


/**
 * Parse content string
 *
 * @public
 * @param  {String}   data     Crontab content
 * @param  {Function} callback
 */
CronParser.parseString = function(data, callback) {
  var self = this;
  var blocks = data.split('\n');
  var count = blocks.length;
  var called = false;

  var response = {
    variables: {},
    expressions: [],
    errors: {}
  };

  blocks.forEach(function(entry, index) {
    var matches = null;
    entry = entry.replace(/^\s+|\s+$/g, ''); // Remove surrounding spaces

    if (entry.length > 0) {
      if (entry.match(/^#/)) { // Comment
        count--;
        return;
      } else if ((matches = entry.match(/^(.*)=(.*)$/))) { // Variable
        count--;
        response.variables[matches[1]] = matches[2];
        return;
      } else { // Expression?
        self._parseEntry('0 ' + entry, function(err, result) {
          if (err) {
            response.errors[entry] = err;
          } else {
            response.expressions.push(result.interval);
          }

          if (!called && --count === 0) {
            called = true;
            callback(null, response);
          }
        });
      }
    } else {
      count--;
    }
  });

  if (!called && count === 0) {
    called = true;
    callback(null, response);
  }
};

/**
 * Parse crontab file
 *
 * @public
 * @param  {String}   filePath  Path to file
 * @param  {Function} callback
 */
CronParser.parseFile = function(filePath, callback) {
  var fs = require('fs');
  fs.readFile(filePath, function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    CronParser.parseString(data.toString(), callback);
  });
};

module.exports = CronParser;
