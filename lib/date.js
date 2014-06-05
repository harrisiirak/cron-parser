'use strict';

Date.prototype.addYear = function() {
  this.setFullYear(this.getFullYear() + 1);
};

Date.prototype.addMonth = function() {
  this.setMonth(this.getMonth() + 1);
};

Date.prototype.addDay = function() {
  this.setDate(this.getDate() + 1);
};

Date.prototype.addHour = function() {
  this.setHours(this.getHours() + 1);
};

Date.prototype.addMinute = function() {
  this.setMinutes(this.getMinutes() + 1);
};

Date.prototype.addSecond = function() {
  this.setSeconds(this.getSeconds() + 1);
};
