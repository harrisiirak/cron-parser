'use strict';

var dayjs = require('dayjs');

var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

CronDate.prototype.addYear = function() {
  this._date = this._date.add(1, 'year');
};

CronDate.prototype.addMonth = function() {
  this._date = this._date.add(1, 'month').startOf('month');
};

CronDate.prototype.addDay = function() {
  this._date = this._date.add(1, 'day').startOf('day');
};

CronDate.prototype.addHour = function() {
  var prev = this.getTime();
  this._date = this._date.add(1, 'hour').startOf('hour');
  if (this.getTime() <= prev) {
    this._date = this._date.add(1, 'hour');
  }
};

CronDate.prototype.addMinute = function() {
  var prev = this.getTime();
  this._date = this._date.add(1, 'minute').startOf('minute');
  if (this.getTime() < prev) {
    this._date = this._date.add(1, 'hour');
  }
};

CronDate.prototype.addSecond = function() {
  var prev = this.getTime();
  this._date = this._date.add(1, 'second').startOf('second');
  if (this.getTime() < prev) {
    this._date = this._date.add(1, 'hour');
  }
};

CronDate.prototype.subtractYear = function() {
  this._date = this._date.subtract(1, 'year');
};

CronDate.prototype.subtractMonth = function() {
  this._date = this._date.subtract(1, 'month').endOf('month');
};

CronDate.prototype.subtractDay = function() {
  this._date = this._date.subtract(1, 'day').endOf('day');
};

CronDate.prototype.subtractHour = function() {
  var prev = this.getTime();
  this._date = this._date.subtract(1, 'hour').endOf('hour');
  if (this.getTime() >= prev) {
    this._date = this._date.subtract(1, 'hour');
  }
};

CronDate.prototype.subtractMinute = function() {
  var prev = this.getTime();
  this._date = this._date.subtract(1, 'minute').endOf('minute');
  if (this.getTime() > prev) {
    this._date = this._date.subtract(1, 'hour');
  }
};

CronDate.prototype.subtractSecond = function() {
  var prev = this.getTime();
  this._date = this._date.subtract(1, 'second').startOf('second');
  if (this.getTime() > prev) {
    this._date = this._date.subtract(1, 'hour');
  }
};

CronDate.prototype.getDate = function() {
  return this._date.date();
};

CronDate.prototype.getFullYear = function() {
  return this._date.year();
};

CronDate.prototype.getDay = function() {
  return this._date.day();
};

CronDate.prototype.getMonth = function() {
  return this._date.month();
};

CronDate.prototype.getHours = function() {
  return this._date.hour();
};

CronDate.prototype.getMinutes = function() {
  return this._date.minute();
};

CronDate.prototype.getSeconds = function() {
  return this._date.second();
};

CronDate.prototype.getMilliseconds = function() {
  return this._date.millisecond();
};

CronDate.prototype.getTime = function() {
  return this._date.valueOf();
};

CronDate.prototype.getUTCDate = function() {
  return this._getUTC().date();
};

CronDate.prototype.getUTCFullYear = function() {
  return this._getUTC().year();
};

CronDate.prototype.getUTCDay = function() {
  return this._getUTC().day();
};

CronDate.prototype.getUTCMonth = function() {
  return this._getUTC().month();
};

CronDate.prototype.getUTCHours = function() {
  return this._getUTC().hour();
};

CronDate.prototype.getUTCMinutes = function() {
  return this._getUTC().minute();
};

CronDate.prototype.getUTCSeconds = function() {
  return this._getUTC().second();
};

CronDate.prototype.toISOString = function() {
  return this._date.toISOString();
};

CronDate.prototype.toJSON = function() {
  return this._date.toJSON();
};

CronDate.prototype.setDate = function(d) {
  this._date = this._date.date(d);
  return this._date;
};

CronDate.prototype.setFullYear = function(y) {
  this._date = this._date.year(y);
  return this._date;
};

CronDate.prototype.setDay = function(d) {
  this._date = this._date.day(d);
  return this._date;
};

CronDate.prototype.setMonth = function(m) {
  this._date = this._date.month(m);
  return this._date;
};

CronDate.prototype.setHours = function(h) {
  this._date = this._date.hour(h);
  return this._date;
};

CronDate.prototype.setMinutes = function(m) {
  this._date = this._date.minute(m);
  return this._date;
};

CronDate.prototype.setSeconds = function(s) {
  this._date = this._date.second(s);
  return this._date;
};

CronDate.prototype.setMilliseconds = function(s) {
  this._date = this._date.millisecond(s);
  return this._date;
};

CronDate.prototype.getTime = function() {
  return this._date.valueOf();
};

CronDate.prototype._getUTC = function() {
  return this._date.utc();
};

CronDate.prototype.toString = function() {
  return this._date.toString();
};

CronDate.prototype.toDate = function() {
  return this._date.toDate();
};

function CronDate(timestamp, tz) {
  if (timestamp instanceof CronDate) {
    timestamp = timestamp._date;
  }

  if (!tz) {
    this._date = dayjs(timestamp);
  } else {
    this._date = dayjs.tz(timestamp, tz);
  }
}

module.exports = CronDate;
