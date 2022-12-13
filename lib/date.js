'use strict';

var luxon = require('luxon');

class CronDate {
  constructor (timestamp, tz) {
    var dateOpts = { zone: tz };
    if (!timestamp) {
      this._date = luxon.DateTime.local();
    } else if (timestamp instanceof CronDate) {
      this._date = timestamp._date;
    } else if (timestamp instanceof Date) {
      this._date = luxon.DateTime.fromJSDate(timestamp, dateOpts);
    } else if (typeof timestamp === 'number') {
      this._date = luxon.DateTime.fromMillis(timestamp, dateOpts);
    } else if (typeof timestamp === 'string') {
      this._date = luxon.DateTime.fromISO(timestamp, dateOpts);
      this._date.isValid || (this._date = luxon.DateTime.fromRFC2822(timestamp, dateOpts));
      this._date.isValid || (this._date = luxon.DateTime.fromSQL(timestamp, dateOpts));
      // RFC2822-like format without the required timezone offset (used in tests)
      this._date.isValid || (this._date = luxon.DateTime.fromFormat(timestamp, 'EEE, d MMM yyyy HH:mm:ss', dateOpts));
    }

    if (!this._date || !this._date.isValid) {
      throw new Error('CronDate: unhandled timestamp: ' + JSON.stringify(timestamp));
    }

    if (tz && tz !== this._date.zoneName) {
      this._date = this._date.setZone(tz);
    }
  }

  addYear () {
    this._date = this._date.plus({ years: 1 });
  }

  addMonth () {
    this._date = this._date.plus({ months: 1 }).startOf('month');
  }

  addDay () {
    this._date = this._date.plus({ days: 1 }).startOf('day');
  }

  addHour () {
    var prev = this._date;
    this._date = this._date.plus({ hours: 1 }).startOf('hour');
    if (this._date <= prev) {
      this._date = this._date.plus({ hours: 1 });
    }
  }

  addMinute () {
    var prev = this._date;
    this._date = this._date.plus({ minutes: 1 }).startOf('minute');
    if (this._date < prev) {
      this._date = this._date.plus({ hours: 1 });
    }
  }

  addSecond () {
    var prev = this._date;
    this._date = this._date.plus({ seconds: 1 }).startOf('second');
    if (this._date < prev) {
      this._date = this._date.plus({ hours: 1 });
    }
  }

  subtractYear () {
    this._date = this._date.minus({ years: 1 });
  }

  subtractMonth () {
    this._date = this._date
      .minus({ months: 1 })
      .endOf('month')
      .startOf('second');
  }

  subtractDay () {
    this._date = this._date
      .minus({ days: 1 })
      .endOf('day')
      .startOf('second');
  }

  subtractHour () {
    var prev = this._date;
    this._date = this._date
      .minus({ hours: 1 })
      .endOf('hour')
      .startOf('second');
    if (this._date >= prev) {
      this._date = this._date.minus({ hours: 1 });
    }
  }

  subtractMinute () {
    var prev = this._date;
    this._date = this._date.minus({ minutes: 1 })
      .endOf('minute')
      .startOf('second');
    if (this._date > prev) {
      this._date = this._date.minus({ hours: 1 });
    }
  }

  subtractSecond () {
    var prev = this._date;
    this._date = this._date
      .minus({ seconds: 1 })
      .startOf('second');
    if (this._date > prev) {
      this._date = this._date.minus({ hours: 1 });
    }
  }

  getDate () {
    return this._date.day;
  }

  getFullYear () {
    return this._date.year;
  }

  getDay () {
    var weekday = this._date.weekday;
    return weekday == 7 ? 0 : weekday;
  }

  getMonth () {
    return this._date.month - 1;
  }

  getHours () {
    return this._date.hour;
  }

  getMinutes () {
    return this._date.minute;
  }

  getSeconds () {
    return this._date.second;
  }

  getMilliseconds () {
    return this._date.millisecond;
  }

  getTime () {
    return this._date.valueOf();
  }

  getUTCDate () {
    return this._getUTC().day;
  }

  getUTCFullYear () {
    return this._getUTC().year;
  }

  getUTCDay () {
    var weekday = this._getUTC().weekday;
    return weekday == 7 ? 0 : weekday;
  }

  getUTCMonth () {
    return this._getUTC().month - 1;
  }

  getUTCHours () {
    return this._getUTC().hour;
  }

  getUTCMinutes () {
    return this._getUTC().minute;
  }

  getUTCSeconds () {
    return this._getUTC().second;
  }

  toISOString () {
    return this._date.toUTC().toISO();
  }

  toJSON () {
    return this._date.toJSON();
  }

  setDate (d) {
    this._date = this._date.set({ day: d });
  }

  setFullYear (y) {
    this._date = this._date.set({ year: y });
  }

  setDay (d) {
    this._date = this._date.set({ weekday: d });
  }

  setMonth (m) {
    this._date = this._date.set({ month: m + 1 });
  }

  setHours (h) {
    this._date = this._date.set({ hour: h });
  }

  setMinutes (m) {
    this._date = this._date.set({ minute: m });
  }

  setSeconds (s) {
    this._date = this._date.set({ second: s });
  }

  setMilliseconds (s) {
    this._date = this._date.set({ millisecond: s });
  }

  _getUTC () {
    return this._date.toUTC();
  }

  toString () {
    return this.toDate().toString();
  }

  toDate () {
    return this._date.toJSDate();
  }

  isLastDayOfMonth () {
    //next day
    var newDate = this._date.plus({ days: 1 }).startOf('day');
    return this._date.month !== newDate.month;
  }

  /**
   * Returns true when the current weekday is the last occurrence of this weekday
   * for the present month.
   */
  isLastWeekdayOfMonth () {
    // Check this by adding 7 days to the current date and seeing if it's
    // a different month
    var newDate = this._date.plus({ days: 7 }).startOf('day');
    return this._date.month !== newDate.month;
  }
}

module.exports = CronDate;
