'use strict';

var dateFns = require('date-fns');
var dateFnsTz = require('date-fns-tz');

CronDate.prototype.addYear = function () {
  this._date = dateFns.addYears(this._date, 1);
};

CronDate.prototype.addMonth = function () {
  this._date = dateFns.startOfDay(dateFns.addMonths(this._date, 1));
};

CronDate.prototype.addDay = function () {
  this._date = dateFns.startOfDay(dateFns.addDays(this._date, 1));
};

CronDate.prototype.addHour = function () {
  var prev = this._date;
  // Store the hour before the transition
  var prevHour = this._date.getHours();
  this._date = dateFns.startOfHour(dateFns.addHours(this._date, 1));

  // Handle DST transitions
  if (this._date <= prev || this._date.getHours() === prevHour) {
    // If we're stuck at the same hour (DST fall back) or went backwards (DST spring forward)
    this._date = dateFns.addHours(this._date, 1);
  }
};

CronDate.prototype.addMinute = function () {
  var prev = this._date;
  this._date = dateFns.startOfMinute(dateFns.addMinutes(this._date, 1));
  if (this._date < prev) {
    this._date = dateFns.addHours(this._date, 1);
  }
};

CronDate.prototype.addSecond = function () {
  var prev = this._date;
  this._date = dateFns.startOfSecond(dateFns.addSeconds(this._date, 1));
  if (this._date < prev) {
    this._date = dateFns.addHours(this._date, 1);
  }
};

CronDate.prototype.subtractYear = function () {
  this._date = dateFns.subYears(this._date, 1);
};

CronDate.prototype.subtractMonth = function () {
  this._date = dateFns.startOfSecond(
    dateFns.endOfMonth(dateFns.subMonths(this._date, 1))
  );
};

CronDate.prototype.subtractDay = function () {
  this._date = dateFns.startOfSecond(
    dateFns.endOfDay(dateFns.subDays(this._date, 1))
  );
};

CronDate.prototype.subtractHour = function () {
  var prev = this._date;
  var prevHour = this._date.getHours();
  this._date = dateFns.startOfSecond(
    dateFns.endOfHour(dateFns.subHours(this._date, 1))
  );

  // Handle DST transitions
  if (this._date >= prev || this._date.getHours() === prevHour) {
    this._date = dateFns.subHours(this._date, 1);
  }
};

CronDate.prototype.subtractMinute = function () {
  var prev = this._date;
  this._date = dateFns.startOfSecond(
    dateFns.endOfMinute(dateFns.subMinutes(this._date, 1))
  );
  if (this._date > prev) {
    this._date = dateFns.subHours(this._date, 1);
  }
};

CronDate.prototype.subtractSecond = function () {
  var prev = this._date;
  this._date = dateFns.startOfSecond(dateFns.subSeconds(this._date, 1));
  if (this._date > prev) {
    this._date = dateFns.subHours(this._date, 1);
  }
};

CronDate.prototype.getDate = function () {
  if (this._utc) {
    return this._date.getUTCDate();
  }
  return dateFns.getDate(this._date);
};

CronDate.prototype.getFullYear = function () {
  if (this._utc) {
    return this._date.getUTCFullYear();
  }
  return dateFns.getYear(this._date);
};

CronDate.prototype.getDay = function () {
  if (this._utc) {
    return this._date.getUTCDay();
  }
  return dateFns.getDay(this._date);
};

CronDate.prototype.getMonth = function () {
  if (this._utc) {
    return this._date.getUTCMonth();
  }
  return dateFns.getMonth(this._date);
};

CronDate.prototype.getHours = function () {
  if (this._utc) {
    return this._date.getUTCHours();
  }
  var hours = dateFns.getHours(this._date);
  return hours;
};

CronDate.prototype.getMinutes = function () {
  if (this._utc) {
    return this._date.getUTCMinutes();
  }
  return dateFns.getMinutes(this._date);
};

CronDate.prototype.getSeconds = function () {
  if (this._utc) {
    return this._date.getUTCSeconds();
  }
  return dateFns.getSeconds(this._date);
};

CronDate.prototype.getMilliseconds = function () {
  if (this._utc) {
    return this._date.getUTCMilliseconds();
  }
  return dateFns.getMilliseconds(this._date);
};

CronDate.prototype.getTime = function () {
  return dateFns.getTime(this._date);
};

CronDate.prototype.getUTCDate = function () {
  return this._date.getUTCDate();
};

CronDate.prototype.getUTCFullYear = function () {
  return this._date.getUTCFullYear();
};

CronDate.prototype.getUTCDay = function () {
  return this._date.getUTCDay();
};

CronDate.prototype.getUTCMonth = function () {
  return this._date.getUTCMonth();
};

CronDate.prototype.getUTCHours = function () {
  return this._date.getUTCHours();
};

CronDate.prototype.getUTCMinutes = function () {
  return this._date.getUTCMinutes();
};

CronDate.prototype.getUTCSeconds = function () {
  return this._date.getUTCSeconds();
};

CronDate.prototype.toISOString = function () {
  return this._date.toISOString();
};

CronDate.prototype.toJSON = function () {
  return this._date.toJSON();
};

CronDate.prototype.setDate = function (d) {
  this._date = setDate(this._date, d);
};

CronDate.prototype.setFullYear = function (y) {
  this._date = setYear(this._date, y);
};

CronDate.prototype.setDay = function (d) {
  // date-fns doesn't have direct weekday setter, we need to calculate the difference
  var currentDay = dateFns.getDay(this._date);
  var diff = d - currentDay;
  this._date = dateFns.addDays(this._date, diff);
};

CronDate.prototype.setMonth = function (m) {
  this._date = dateFns.setMonth(this._date, m);
};

CronDate.prototype.setHours = function (h) {
  this._date = dateFns.setHours(this._date, h);
};

CronDate.prototype.setMinutes = function (m) {
  this._date = dateFns.setMinutes(this._date, m);
};

CronDate.prototype.setSeconds = function (s) {
  this._date = dateFns.setSeconds(this._date, s);
};

CronDate.prototype.setMilliseconds = function (ms) {
  this._date = dateFns.setMilliseconds(this._date, ms);
};

CronDate.prototype._getUTC = function () {
  return new Date(this._date.toUTCString());
};

CronDate.prototype.toString = function () {
  return this._date.toString();
};

CronDate.prototype.toDate = function () {
  return this._date;
};

CronDate.prototype.isLastDayOfMonth = function () {
  return dateFns.isLastDayOfMonth(this._date);
};

CronDate.prototype.isLastWeekdayOfMonth = function () {
  var nextWeek = dateFns.addWeeks(this._date, 1);
  return dateFns.getMonth(this._date) !== dateFns.getMonth(nextWeek);
};

function CronDate(timestamp, tz) {
  if (!timestamp) {
    this._date = new Date();
  } else if (timestamp instanceof CronDate) {
    this._date = new Date(timestamp._date);
    this._utc = timestamp._utc;
  } else if (timestamp instanceof Date) {
    this._date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    this._date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    var parsedDate = dateFns.parseISO(timestamp);

    if (!dateFns.isValid(parsedDate)) {
      parsedDate = dateFns.parse(
        timestamp,
        'EEE, dd MMM yyyy HH:mm:ss xx',
        new Date()
      );
    }

    if (!dateFns.isValid(parsedDate)) {
      parsedDate = dateFns.parse(timestamp, 'yyyy-MM-dd HH:mm:ss');
    }

    if (!dateFns.isValid(parsedDate)) {
      parsedDate = dateFns.parse(
        timestamp,
        'EEE, d MMM yyyy HH:mm:ss',
        new Date()
      );
    }

    if (!dateFns.isValid(parsedDate)) {
      throw new Error(
        'CronDate: unhandled timestamp: ' + JSON.stringify(timestamp)
      );
    }
    if (tz) parsedDate = dateFnsTz.toDate(parsedDate, { timeZone: tz });
    this._date = parsedDate;
  }

  this._utc = tz === 'UTC' || tz === true;
}

module.exports = CronDate;
