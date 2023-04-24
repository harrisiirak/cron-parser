"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronDate = void 0;
const luxon_1 = require("luxon");
const assert_1 = __importDefault(require("assert"));
const types_1 = require("./types");
/**
 * CronDate class that wraps the Luxon DateTime object to provide
 * a consistent API for working with dates and times in the context of cron.
 */
class CronDate {
    #date;
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
            this.#date = luxon_1.DateTime.local();
        }
        else if (timestamp instanceof CronDate) {
            this.#date = timestamp.#date;
            this.#dstStart = timestamp.#dstStart;
            this.#dstEnd = timestamp.#dstEnd;
        }
        else if (timestamp instanceof Date) {
            this.#date = luxon_1.DateTime.fromJSDate(timestamp, dateOpts);
        }
        else if (typeof timestamp === 'number') {
            this.#date = luxon_1.DateTime.fromMillis(timestamp, dateOpts);
        }
        else { // redundant typeof check: 'timestamp' always has type 'string'
            this.#date = luxon_1.DateTime.fromISO(timestamp, dateOpts);
            this.#date.isValid || (this.#date = luxon_1.DateTime.fromRFC2822(timestamp, dateOpts));
            this.#date.isValid || (this.#date = luxon_1.DateTime.fromSQL(timestamp, dateOpts));
            this.#date.isValid || (this.#date = luxon_1.DateTime.fromFormat(timestamp, 'EEE, d MMM yyyy HH:mm:ss', dateOpts));
        }
        // Check for valid DateTime and throw an error if not valid.
        (0, assert_1.default)(this.#date && this.#date.isValid, `CronDate: unhandled timestamp: ${JSON.stringify(timestamp)}`);
        // Set the timezone if it is provided and different from the current zone.
        if (tz && tz !== this.#date.zoneName) {
            this.#date = this.#date.setZone(tz);
        }
    }
    /**
     * Adds one year to the current CronDate.
     */
    addYear() {
        this.#date = this.#date.plus({ years: 1 });
    }
    /**
     * Adds one month to the current CronDate.
     */
    addMonth() {
        this.#date = this.#date.plus({ months: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('month');
    }
    /**
     * Adds one day to the current CronDate.
     */
    addDay() {
        this.#date = this.#date.plus({ days: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('day');
    }
    /**
     * Adds one hour to the current CronDate.
     */
    addHour() {
        const prev = this.#date;
        this.#date = this.#date.plus({ hours: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('hour');
        /* istanbul ignore next - TODO this is not need */
        if (this.#date <= prev) {
            this.#date = this.#date.plus({ day: 1 });
        }
    }
    /**
     * Adds one minute to the current CronDate.
     */
    addMinute() {
        const prev = this.#date;
        this.#date = this.#date.plus({ minutes: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('minute');
        /* istanbul ignore next - TODO this is not need */
        if (this.#date < prev) {
            this.#date = this.#date.plus({ hours: 1 });
        }
    }
    /**
     * Adds one second to the current CronDate.
     */
    addSecond() {
        const prev = this.#date;
        this.#date = this.#date.plus({ seconds: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this.#date < prev) {
            this.#date = this.#date.plus({ hours: 1 });
        }
    }
    /**
     * Subtracts one year from the current CronDate.
     */
    subtractYear() {
        this.#date = this.#date.minus({ years: 1 });
    }
    /**
     * Subtracts one month from the current CronDate.
     * If the month is 1, it will subtract one year instead.
     */
    subtractMonth() {
        this.#date = this.#date
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
        this.#date = this.#date
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
        const prev = this.#date;
        this.#date = this.#date
            .minus({ hours: 1 })
            // TODO - this is weird, but it's what the original code did
            .endOf('hour')
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this.#date >= prev) {
            this.#date = this.#date.minus({ hours: 1 });
        }
    }
    /**
     * Subtracts one minute from the current CronDate.
     * If the minute is 0, it will subtract one hour instead.
     */
    subtractMinute() {
        const prev = this.#date;
        this.#date = this.#date.minus({ minutes: 1 })
            .endOf('minute')
            // TODO - this is weird, but it's what the original code did
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this.#date > prev) {
            this.#date = this.#date.minus({ hours: 1 });
        }
    }
    /**
     * Subtracts one second from the current CronDate.
     * If the second is 0, it will subtract one minute instead.
     */
    subtractSecond() {
        const prev = this.#date;
        this.#date = this.#date
            .minus({ seconds: 1 })
            // TODO - this is weird, but it's what the original code did
            .startOf('second');
        /* istanbul ignore next - TODO this is not need */
        if (this.#date > prev) {
            this.#date = this.#date.minus({ hours: 1 });
        }
    }
    addUnit(unit) {
        const unitMap = {
            [types_1.TimeUnitsEnum.year]: () => this.addYear(),
            [types_1.TimeUnitsEnum.month]: () => this.addMonth(),
            [types_1.TimeUnitsEnum.day]: () => this.addDay(),
            [types_1.TimeUnitsEnum.hour]: () => this.addHour(),
            [types_1.TimeUnitsEnum.minute]: () => this.addMinute(),
            [types_1.TimeUnitsEnum.second]: () => this.addSecond(),
        };
        (0, assert_1.default)(unit in unitMap, `Invalid unit: ${unit}`);
        unitMap[unit]();
    }
    subtractUnit(unit) {
        const unitMap = {
            [types_1.TimeUnitsEnum.year]: () => this.subtractYear(),
            [types_1.TimeUnitsEnum.month]: () => this.subtractMonth(),
            [types_1.TimeUnitsEnum.day]: () => this.subtractDay(),
            [types_1.TimeUnitsEnum.hour]: () => this.subtractHour(),
            [types_1.TimeUnitsEnum.minute]: () => this.subtractMinute(),
            [types_1.TimeUnitsEnum.second]: () => this.subtractSecond(),
        };
        (0, assert_1.default)(unit in unitMap, `Invalid unit: ${unit}`);
        unitMap[unit]();
    }
    handleMathOp(verb, unit) {
        if (verb === types_1.DateMathOpEnum.add) {
            this.addUnit(unit);
            return;
        }
        if (verb === types_1.DateMathOpEnum.subtract) {
            this.subtractUnit(unit);
            return;
        }
        throw new Error(`Invalid verb: ${verb}`);
    }
    /**
     * Returns the day.
     * @returns {number}
     */
    getDate() {
        return this.#date.day;
    }
    /**
     * Returns the year.
     * @returns {number}
     */
    getFullYear() {
        return this.#date.year;
    }
    /**
     * Returns the day of the week.
     * @returns {number}
     */
    getDay() {
        const weekday = this.#date.weekday;
        return weekday === 7 ? 0 : weekday;
    }
    /**
     * Returns the month.
     * @returns {number}
     */
    getMonth() {
        return this.#date.month - 1;
    }
    /**
     * Returns the hour.
     * @returns {number}
     */
    getHours() {
        return this.#date.hour;
    }
    /**
     * Returns the minutes.
     * @returns {number}
     */
    getMinutes() {
        return this.#date.minute;
    }
    /**
     * Returns the seconds.
     * @returns {number}
     */
    getSeconds() {
        return this.#date.second;
    }
    /**
     * Returns the milliseconds.
     * @returns {number}
     */
    getMilliseconds() {
        return this.#date.millisecond;
    }
    /**
     * Returns the time.
     * @returns {number}
     */
    getTime() {
        return this.#date.valueOf();
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
        return this.#date.toUTC().toISO();
    }
    /**
     * Returns the date as a JSON string.
     * @returns {string | null}
     */
    toJSON() {
        return this.#date.toJSON();
    }
    /**
     * Sets the day.
     * @param d
     */
    setDate(d) {
        this.#date = this.#date.set({ day: d });
    }
    /**
     * Sets the year.
     * @param y
     */
    setFullYear(y) {
        this.#date = this.#date.set({ year: y });
    }
    /**
     * Sets the day of the week.
     * @param d
     */
    setDay(d) {
        this.#date = this.#date.set({ weekday: d });
    }
    /**
     * Sets the month.
     * @param m
     */
    setMonth(m) {
        this.#date = this.#date.set({ month: m + 1 });
    }
    /**
     * Sets the hour.
     * @param h
     */
    setHours(h) {
        this.#date = this.#date.set({ hour: h });
    }
    /**
     * Sets the minutes.
     * @param m
     */
    setMinutes(m) {
        this.#date = this.#date.set({ minute: m });
    }
    /**
     * Sets the seconds.
     * @param s
     */
    setSeconds(s) {
        this.#date = this.#date.set({ second: s });
    }
    /**
     * Sets the milliseconds.
     * @param s
     */
    setMilliseconds(s) {
        this.#date = this.#date.set({ millisecond: s });
    }
    /**
     * Returns the UTC date.
     * @private
     * @returns {DateTime}
     */
    _getUTC() {
        return this.#date.toUTC();
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
        return this.#date.toJSDate();
    }
    /**
     * Returns true if the day is the last day of the month.
     * @returns {boolean}
     */
    isLastDayOfMonth() {
        const newDate = this.#date.plus({ days: 1 }).startOf('day');
        return this.#date.month !== newDate.month;
    }
    /**
     * Returns true if the day is the last weekday of the month.
     * @returns {boolean}
     */
    isLastWeekdayOfMonth() {
        const newDate = this.#date.plus({ days: 7 }).startOf('day');
        return this.#date.month !== newDate.month;
    }
    // todo - doesn't work - few test fail
    shiftTimezone(op, unit, hoursLength) {
        if (unit === types_1.TimeUnitsEnum.month || unit === types_1.TimeUnitsEnum.day) {
            const prevTime = this.getTime();
            this.handleMathOp(op, unit);
            const currTime = this.getTime();
            if (prevTime === currTime) {
                if (this.getMinutes() === 0 && this.getSeconds() === 0) {
                    this.addHour();
                }
                else if (this.getMinutes() === 59 && this.getSeconds() === 59) {
                    this.subtractHour();
                }
            }
        }
        else {
            const previousHour = this.getHours();
            this.handleMathOp(op, unit);
            const currentHour = this.getHours();
            const diff = currentHour - previousHour;
            if (diff === 2) {
                if (hoursLength !== 24) {
                    this.dstStart = currentHour;
                }
            }
            else if (diff === 0 && this.getMinutes() === 0 && this.getSeconds() === 0) {
                if (hoursLength !== 24) {
                    this.dstEnd = currentHour;
                }
            }
        }
    }
    get dstStart() {
        return this.#dstStart;
    }
    set dstStart(value) {
        this.#dstStart = value;
    }
    get dstEnd() {
        return this.#dstEnd;
    }
    set dstEnd(value) {
        this.#dstEnd = value;
    }
}
exports.CronDate = CronDate;
exports.default = CronDate;
