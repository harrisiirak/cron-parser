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
    this.setDate(day + 1);
  }
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
