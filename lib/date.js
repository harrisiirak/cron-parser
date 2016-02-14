'use strict';

var moment = require('moment-timezone');

CronDate.prototype.addYear = function() {
  this.date.add(1, 'year');
};

CronDate.prototype.addMonth = function() {
  this.date.add(1, 'month').startOf('month');
};

CronDate.prototype.addDay = function() {
  this.date.add(1, 'day').startOf('day');
};

CronDate.prototype.addHour = function() {
  this.date.add(1, 'hour').startOf('hour');
};

CronDate.prototype.addMinute = function() {
  this.date.add(1, 'minute').startOf('minute');
};

CronDate.prototype.addSecond = function() {
  this.date.add(1, 'second').startOf('second');
};

CronDate.prototype.getDate = function() {
  return this.date.date();
};

CronDate.prototype.getFullYear = function() {
  return this.date.year();
};

CronDate.prototype.getDay = function() {
  return this.date.day();
};

CronDate.prototype.getMonth = function() {
  return this.date.month();
};

CronDate.prototype.getHours = function() {
  return this.date.hours();
};

CronDate.prototype.getMinutes = function() {
  return this.date.minute();
};

CronDate.prototype.getSeconds = function() {
  return this.date.second();
};

CronDate.prototype.getTime = function() {
  return this.date.valueOf();
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
  return this._getUTC().hours();
};

CronDate.prototype.getUTCMinutes = function() {
  return this._getUTC().minute();
};

CronDate.prototype.getUTCSeconds = function() {
  return this._getUTC().second();
};

CronDate.prototype.setDate = function(d) {
  return this.date.date(d);
};

CronDate.prototype.setFullYear = function(y) {
  return this.date.year(y);
};

CronDate.prototype.setDay = function(d) {
  return this.date.day(d);
};

CronDate.prototype.setMonth = function(m) {
  return this.date.month(m);
};

CronDate.prototype.setHours = function(h) {
  return this.date.hour(h);
};

CronDate.prototype.setMinutes = function(m) {
  return this.date.minute(m);
};

CronDate.prototype.setSeconds = function(s) {
  return this.date.second(s);
};

CronDate.prototype.getTime = function() {
  return this.date.valueOf();
};

CronDate.prototype._getUTC = function() {
  return moment.utc(this.date);
};

CronDate.prototype.toString = function() {
  return this.date.toString();
};

function CronDate (timestamp, tz) {
  if (timestamp instanceof CronDate) {
    timestamp = timestamp.date;
  }

  if (!tz) {
    this.date = moment(timestamp);
  } else {
    this.date = moment.tz(timestamp, tz);
  }
}

module.exports = CronDate;
