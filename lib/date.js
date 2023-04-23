"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronDate = void 0;
const luxon_1 = require("luxon");
const assert_1 = __importDefault(require("assert"));
/**
 * CronDate class that wraps the Luxon DateTime object to provide
 * a consistent API for working with dates and times in the context of cron.
 */
class CronDate {
    _date;
    #dstStart = null;
    #dstEnd = null;
    /**
     * Constructs a new CronDate instance.
     * @param {CronDate | Date | number | string} [timestamp] - The timestamp to initialize the CronDate with.
     * @param {string} [tz] - The timezone to use for the CronDate.
     */
    constructor(timestamp, tz) {
        const dateOpts = { zone: tz };
        // Initialize the internal DateTime object based on the type of timestamp provided.
        if (!timestamp) {
            this._date = luxon_1.DateTime.local();
        }
        else if (timestamp instanceof CronDate) {
            this._date = timestamp._date;
        }
        else if (timestamp instanceof Date) {
            this._date = luxon_1.DateTime.fromJSDate(timestamp, dateOpts);
        }
        else if (typeof timestamp === 'number') {
            this._date = luxon_1.DateTime.fromMillis(timestamp, dateOpts);
        }
        else { // redundant typeof check: 'timestamp' always has type 'string'
            this._date = luxon_1.DateTime.fromISO(timestamp, dateOpts);
            this._date.isValid || (this._date = luxon_1.DateTime.fromRFC2822(timestamp, dateOpts));
            this._date.isValid || (this._date = luxon_1.DateTime.fromSQL(timestamp, dateOpts));
            this._date.isValid || (this._date = luxon_1.DateTime.fromFormat(timestamp, 'EEE, d MMM yyyy HH:mm:ss', dateOpts));
        }
        // Check for valid DateTime and throw an error if not valid.
        if (!this._date || !this._date.isValid) {
            throw new Error('CronDate: unhandled timestamp: ' + JSON.stringify(timestamp));
        }
        // Set the timezone if it is provided and different from the current zone.
        if (tz && tz !== this._date.zoneName) {
            this._date = this._date.setZone(tz);
        }
    }
    /**
     * Adds one year to the current CronDate.
     */
    addYear() {
        this._date = this._date.plus({ years: 1 });
    }
    /**
     * Adds one month to the current CronDate.
     */
    addMonth() {
        this._date = this._date.plus({ months: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('month');
    }
    /**
     * Adds one day to the current CronDate.
     */
    addDay() {
        this._date = this._date.plus({ days: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('day');
    }
    /**
     * Adds one hour to the current CronDate.
     */
    addHour() {
        const prev = this._date;
        this._date = this._date.plus({ hours: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('hour');
        /* istanbul ignore next - TODO this is not need */
        if (this._date <= prev) {
            this._date = this._date.plus({ day: 1 });
        }
    }
    /**
     * Adds one minute to the current CronDate.
     */
    addMinute() {
        const prev = this._date;
        this._date = this._date.plus({ minutes: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('minute');
        /* istanbul ignore next - TODO this is not need */
        if (this._date < prev) {
            this._date = this._date.plus({ hours: 1 });
        }
    }
    /**
     * Adds one second to the current CronDate.
     */
    addSecond() {
        const prev = this._date;
        this._date = this._date.plus({ seconds: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this._date < prev) {
            this._date = this._date.plus({ hours: 1 });
        }
    }
    /**
     * Subtracts one year from the current CronDate.
     */
    subtractYear() {
        this._date = this._date.minus({ years: 1 });
    }
    /**
     * Subtracts one month from the current CronDate.
     * If the month is 1, it will subtract one year instead.
     */
    subtractMonth() {
        this._date = this._date
            .minus({ months: 1 })
            // TODO - this is weird, but it's what the original code did
            .endOf('month')
            .startOf('second');
    }
    /**
     * Subtracts one day from the current CronDate.
     * If the day is 1, it will subtract one month instead.
     */
    subtractDay() {
        this._date = this._date
            .minus({ days: 1 })
            // TODO - this is weird, but it's what the original code did
            .endOf('day')
            .startOf('second');
    }
    /**
     * Subtracts one hour from the current CronDate.
     * If the hour is 0, it will subtract one day instead.
     */
    subtractHour() {
        const prev = this._date;
        this._date = this._date
            .minus({ hours: 1 })
            // TODO - this is weird, but it's what the original code did
            .endOf('hour')
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this._date >= prev) {
            this._date = this._date.minus({ hours: 1 });
        }
    }
    /**
     * Subtracts one minute from the current CronDate.
     * If the minute is 0, it will subtract one hour instead.
     */
    subtractMinute() {
        const prev = this._date;
        this._date = this._date.minus({ minutes: 1 })
            .endOf('minute')
            // TODO - this is weird, but it's what the original code did
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this._date > prev) {
            this._date = this._date.minus({ hours: 1 });
        }
    }
    /**
     * Subtracts one second from the current CronDate.
     * If the second is 0, it will subtract one minute instead.
     */
    subtractSecond() {
        const prev = this._date;
        this._date = this._date
            .minus({ seconds: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this._date > prev) {
            this._date = this._date.minus({ hours: 1 });
        }
    }
    addUnit(unit) {
        const unitMap = {
            'Year': () => this.addYear(),
            'Month': () => this.addMonth(),
            'Day': () => this.addDay(),
            'Hour': () => this.addHour(),
            'Minute': () => this.addMinute(),
            'Second': () => this.addSecond(),
        };
        (0, assert_1.default)(unit in unitMap, `Invalid unit: ${unit}`);
        unitMap[unit]();
    }
    subtractUnit(unit) {
        const unitMap = {
            'Year': () => this.subtractYear(),
            'Month': () => this.subtractMonth(),
            'Day': () => this.subtractDay(),
            'Hour': () => this.subtractHour(),
            'Minute': () => this.subtractMinute(),
            'Second': () => this.subtractSecond(),
        };
        (0, assert_1.default)(unit in unitMap, `Invalid unit: ${unit}`);
        unitMap[unit]();
    }
    handleMathOp(verb, unit) {
        if (verb === 'add') {
            this.addUnit(unit);
            return;
        }
        this.subtractUnit(unit);
    }
    /**
     * Returns the day.
     * @returns {number}
     */
    getDate() {
        return this._date.day;
    }
    /**
     * Returns the year.
     * @returns {number}
     */
    getFullYear() {
        return this._date.year;
    }
    /**
     * Returns the day of the week.
     * @returns {number}
     */
    getDay() {
        const weekday = this._date.weekday;
        return weekday === 7 ? 0 : weekday;
    }
    /**
     * Returns the month.
     * @returns {number}
     */
    getMonth() {
        return this._date.month - 1;
    }
    /**
     * Returns the hour.
     * @returns {number}
     */
    getHours() {
        return this._date.hour;
    }
    /**
     * Returns the minutes.
     * @returns {number}
     */
    getMinutes() {
        return this._date.minute;
    }
    /**
     * Returns the seconds.
     * @returns {number}
     */
    getSeconds() {
        return this._date.second;
    }
    /**
     * Returns the milliseconds.
     * @returns {number}
     */
    getMilliseconds() {
        return this._date.millisecond;
    }
    /**
     * Returns the time.
     * @returns {number}
     */
    getTime() {
        return this._date.valueOf();
    }
    /**
     * Returns the UTC day.
     * @returns {number}
     */
    getUTCDate() {
        return this._getUTC().day;
    }
    /**
     * Returns the UTC year.
     * @returns {number}
     */
    getUTCFullYear() {
        return this._getUTC().year;
    }
    /**
     * Returns the UTC day of the week.
     * @returns {number}
     */
    getUTCDay() {
        const weekday = this._getUTC().weekday;
        return weekday === 7 ? 0 : weekday;
    }
    /**
     * Returns the UTC month.
     * @returns {number}
     */
    getUTCMonth() {
        return this._getUTC().month - 1;
    }
    /**
     * Returns the UTC hour.
     * @returns {number}
     */
    getUTCHours() {
        return this._getUTC().hour;
    }
    /**
     * Returns the UTC minutes.
     * @returns {number}
     */
    getUTCMinutes() {
        return this._getUTC().minute;
    }
    /**
     * Returns the UTC seconds.
     * @returns {number}
     */
    getUTCSeconds() {
        return this._getUTC().second;
    }
    /**
     * Returns the UTC milliseconds.
     * @returns {string | null}
     */
    toISOString() {
        return this._date.toUTC().toISO();
    }
    /**
     * Returns the date as a JSON string.
     * @returns {string | null}
     */
    toJSON() {
        return this._date.toJSON();
    }
    /**
     * Sets the day.
     * @param d
     */
    setDate(d) {
        this._date = this._date.set({ day: d });
    }
    /**
     * Sets the year.
     * @param y
     */
    setFullYear(y) {
        this._date = this._date.set({ year: y });
    }
    /**
     * Sets the day of the week.
     * @param d
     */
    setDay(d) {
        this._date = this._date.set({ weekday: d });
    }
    /**
     * Sets the month.
     * @param m
     */
    setMonth(m) {
        this._date = this._date.set({ month: m + 1 });
    }
    /**
     * Sets the hour.
     * @param h
     */
    setHours(h) {
        this._date = this._date.set({ hour: h });
    }
    /**
     * Sets the minutes.
     * @param m
     */
    setMinutes(m) {
        this._date = this._date.set({ minute: m });
    }
    /**
     * Sets the seconds.
     * @param s
     */
    setSeconds(s) {
        this._date = this._date.set({ second: s });
    }
    /**
     * Sets the milliseconds.
     * @param s
     */
    setMilliseconds(s) {
        this._date = this._date.set({ millisecond: s });
    }
    /**
     * Returns the UTC date.
     * @private
     * @returns {DateTime}
     */
    _getUTC() {
        return this._date.toUTC();
    }
    /**
     * Returns the date as a string.
     * @returns {string}
     */
    toString() {
        return this.toDate().toString();
    }
    /**
     * Returns the date as a Date object.
     * @returns {Date}
     */
    toDate() {
        return this._date.toJSDate();
    }
    /**
     * Returns true if the day is the last day of the month.
     * @returns {boolean}
     */
    isLastDayOfMonth() {
        const newDate = this._date.plus({ days: 1 }).startOf('day');
        return this._date.month !== newDate.month;
    }
    /**
     * Returns true if the day is the last weekday of the month.
     * @returns {boolean}
     */
    isLastWeekdayOfMonth() {
        const newDate = this._date.plus({ days: 7 }).startOf('day');
        return this._date.month !== newDate.month;
    }
}
exports.CronDate = CronDate;
exports.default = CronDate;
