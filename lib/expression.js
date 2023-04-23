"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronExpression = void 0;
const CronExpressionParser_1 = require("./CronExpressionParser");
const date_1 = require("./date");
const CronFields_1 = require("./CronFields");
const types_1 = require("./types");
/**
 * Cron iteration loop safety limit
 */
const LOOP_LIMIT = 10000;
var MonthsEnum;
(function (MonthsEnum) {
    MonthsEnum[MonthsEnum["jan"] = 1] = "jan";
    MonthsEnum[MonthsEnum["feb"] = 2] = "feb";
    MonthsEnum[MonthsEnum["mar"] = 3] = "mar";
    MonthsEnum[MonthsEnum["apr"] = 4] = "apr";
    MonthsEnum[MonthsEnum["may"] = 5] = "may";
    MonthsEnum[MonthsEnum["jun"] = 6] = "jun";
    MonthsEnum[MonthsEnum["jul"] = 7] = "jul";
    MonthsEnum[MonthsEnum["aug"] = 8] = "aug";
    MonthsEnum[MonthsEnum["sep"] = 9] = "sep";
    MonthsEnum[MonthsEnum["oct"] = 10] = "oct";
    MonthsEnum[MonthsEnum["nov"] = 11] = "nov";
    MonthsEnum[MonthsEnum["dec"] = 12] = "dec";
})(MonthsEnum || (MonthsEnum = {}));
;
var DayOfWeekEnum;
(function (DayOfWeekEnum) {
    DayOfWeekEnum[DayOfWeekEnum["sun"] = 0] = "sun";
    DayOfWeekEnum[DayOfWeekEnum["mon"] = 1] = "mon";
    DayOfWeekEnum[DayOfWeekEnum["tue"] = 2] = "tue";
    DayOfWeekEnum[DayOfWeekEnum["wed"] = 3] = "wed";
    DayOfWeekEnum[DayOfWeekEnum["thu"] = 4] = "thu";
    DayOfWeekEnum[DayOfWeekEnum["fri"] = 5] = "fri";
    DayOfWeekEnum[DayOfWeekEnum["sat"] = 6] = "sat";
})(DayOfWeekEnum || (DayOfWeekEnum = {}));
;
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["sun"] = 0] = "sun";
    DayOfWeek[DayOfWeek["mon"] = 1] = "mon";
    DayOfWeek[DayOfWeek["tue"] = 2] = "tue";
    DayOfWeek[DayOfWeek["wed"] = 3] = "wed";
    DayOfWeek[DayOfWeek["thu"] = 4] = "thu";
    DayOfWeek[DayOfWeek["fri"] = 5] = "fri";
    DayOfWeek[DayOfWeek["sat"] = 6] = "sat";
})(DayOfWeek || (DayOfWeek = {}));
class CronExpression {
    static map = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
    static predefined = {
        '@yearly': '0 0 1 1 *',
        '@monthly': '0 0 1 * *',
        '@weekly': '0 0 * * 0',
        '@daily': '0 0 * * *',
        '@hourly': '0 * * * *'
    };
    static constraints = [
        { min: 0, max: 59, chars: [] },
        { min: 0, max: 59, chars: [] },
        { min: 0, max: 23, chars: [] },
        { min: 1, max: 31, chars: ['L'] },
        { min: 1, max: 12, chars: [] },
        { min: 0, max: 7, chars: ['L'] }, // Day of week
    ];
    static daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    static aliases = {
        month: { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 },
        dayOfWeek: { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
    };
    static parseDefaults = ['0', '*', '*', '*', '*', '*'];
    static standardValidCharacters = /^[,*\d/-]+$/;
    static dayOfWeekValidCharacters = /^[?,*\dL#/-]+$/;
    static dayOfMonthValidCharacters = /^[?,*\dL/-]+$/;
    static validCharacters = {
        second: CronExpression.standardValidCharacters,
        minute: CronExpression.standardValidCharacters,
        hour: CronExpression.standardValidCharacters,
        dayOfMonth: CronExpression.dayOfMonthValidCharacters,
        month: CronExpression.standardValidCharacters,
        dayOfWeek: CronExpression.dayOfWeekValidCharacters,
    };
    _options;
    _utc;
    _tz;
    _currentDate;
    _startDate;
    _endDate;
    _isIterator;
    _hasIterated;
    _nthDayOfWeek;
    _dstStart = null;
    _dstEnd = null;
    #fields;
    get fields() {
        return new CronFields_1.CronFields(this.#fields);
    }
    constructor(fields, options) {
        this._options = options;
        this._utc = options.utc || false;
        this._tz = this._utc ? 'UTC' : options.tz;
        this._currentDate = new date_1.CronDate(options.currentDate, this._tz);
        this._startDate = options.startDate ? new date_1.CronDate(options.startDate, this._tz) : null;
        this._endDate = options.endDate ? new date_1.CronDate(options.endDate, this._tz) : null;
        this._isIterator = options.iterator || false;
        this._hasIterated = false;
        this._nthDayOfWeek = options.nthDayOfWeek || 0;
        this.#fields = new CronFields_1.CronFields(fields);
    }
    #applyTimezoneShift(currentDate, dateMathOp, unit) {
        if (unit === types_1.TimeUnitsEnum.month || unit === types_1.TimeUnitsEnum.day) {
            const prevTime = currentDate.getTime();
            // using a CronDate[key]() is tricky in ts, we will use a new function to do the same thing
            currentDate.handleMathOp(dateMathOp, unit);
            const currTime = currentDate.getTime();
            if (prevTime === currTime) {
                if (currentDate.getMinutes() === 0 && currentDate.getSeconds() === 0) {
                    currentDate.addHour();
                }
                else if (currentDate.getMinutes() === 59 && currentDate.getSeconds() === 59) {
                    currentDate.subtractHour();
                }
            }
        }
        else {
            const previousHour = currentDate.getHours();
            currentDate.handleMathOp(dateMathOp, unit);
            const currentHour = currentDate.getHours();
            const diff = currentHour - previousHour;
            if (diff === 2) {
                if (this.#fields.hour.length !== 24) {
                    this._dstStart = currentHour;
                }
            }
            else if (diff === 0 && currentDate.getMinutes() === 0 && currentDate.getSeconds() === 0) {
                if (this.#fields.hour.length !== 24) {
                    this._dstEnd = currentHour;
                }
            }
        }
    }
    ;
    /**
     * Find next or previous matching schedule date
     *
     * @return {CronDate}
     * @private
     */
    #findSchedule(reverse) {
        // Whether to use backwards directionality when searching
        reverse = reverse || false;
        const dateMathVerb = reverse ? types_1.DateMathOpEnum.subtract : types_1.DateMathOpEnum.add;
        let currentDate = new date_1.CronDate(this._currentDate, this._tz);
        const startDate = this._startDate;
        const endDate = this._endDate;
        const startTimestamp = currentDate.getTime();
        let stepCount = 0;
        while (stepCount < LOOP_LIMIT) {
            stepCount++;
            if (reverse) {
                if (startDate && (currentDate.getTime() - startDate.getTime() < 0)) {
                    throw new Error('Out of the timespan range');
                }
            }
            else {
                if (endDate && (endDate.getTime() - currentDate.getTime()) < 0) {
                    throw new Error('Out of the timespan range');
                }
            }
            let dayOfMonthMatch = CronExpression.#matchSchedule(currentDate.getDate(), this.#fields.dayOfMonth);
            if (CronExpression.#isLInExpressions(this.#fields.dayOfMonth)) {
                dayOfMonthMatch = dayOfMonthMatch || currentDate.isLastDayOfMonth();
            }
            let dayOfWeekMatch = CronExpression.#matchSchedule(currentDate.getDay(), this.#fields.dayOfWeek);
            if (CronExpression.#isLInExpressions(this.#fields.dayOfWeek)) {
                dayOfWeekMatch = dayOfWeekMatch || CronExpression.#isLastWeekdayOfMonthMatch(this.#fields.dayOfWeek, currentDate);
            }
            const isDayOfMonthWildcardMatch = this.#fields.dayOfMonth.length >= CronExpression.daysInMonth[currentDate.getMonth()];
            const isDayOfWeekWildcardMatch = this.#fields.dayOfWeek.length === CronExpression.constraints[5].max - CronExpression.constraints[5].min + 1;
            const currentHour = currentDate.getHours();
            if (!dayOfMonthMatch && (!dayOfWeekMatch || isDayOfWeekWildcardMatch)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
                continue;
            }
            if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !dayOfMonthMatch) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
                continue;
            }
            if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !dayOfWeekMatch) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
                continue;
            }
            if (this._nthDayOfWeek > 0 && !CronExpression.#isNthDayMatch(currentDate, this._nthDayOfWeek)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
                continue;
            }
            if (!CronExpression.#matchSchedule(currentDate.getMonth() + 1, this.#fields.month)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.month);
                continue;
            }
            if (!CronExpression.#matchSchedule(currentHour, this.#fields.hour)) {
                if (this._dstStart !== currentHour) {
                    this._dstStart = null;
                    this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.hour);
                    continue;
                }
                else if (!CronExpression.#matchSchedule(currentHour - 1, this.#fields.hour)) {
                    currentDate.handleMathOp(dateMathVerb, types_1.TimeUnitsEnum.hour);
                    continue;
                }
            }
            else if (this._dstEnd === currentHour) {
                if (!reverse) {
                    this._dstEnd = null;
                    this.#applyTimezoneShift(currentDate, types_1.DateMathOpEnum.add, types_1.TimeUnitsEnum.hour);
                    continue;
                }
            }
            if (!CronExpression.#matchSchedule(currentDate.getMinutes(), this.#fields.minute)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.minute);
                continue;
            }
            if (!CronExpression.#matchSchedule(currentDate.getSeconds(), this.#fields.second)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.second);
                continue;
            }
            if (startTimestamp === currentDate.getTime()) {
                if ((dateMathVerb === 'add') || (currentDate.getMilliseconds() === 0)) {
                    this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.second);
                }
                else {
                    currentDate.setMilliseconds(0);
                }
                continue;
            }
            break;
        }
        if (stepCount >= LOOP_LIMIT) {
            throw new Error('Invalid expression, loop limit exceeded');
        }
        this._currentDate = new date_1.CronDate(currentDate, this._tz);
        this._hasIterated = true;
        return currentDate;
    }
    ;
    /**
     * Find next suitable date
     *
     * @public
     * @return {CronDate|Object}
     */
    next() {
        const schedule = this.#findSchedule();
        // Try to return ES6 compatible iterator
        return this._isIterator ? { value: schedule, done: !this.hasNext() } : schedule;
    }
    /**
     * Find previous suitable date
     *
     * @public
     * @return {CronDate|Object}
     */
    prev() {
        const schedule = this.#findSchedule(true);
        // Try to return ES6 compatible iterator
        return this._isIterator ? { value: schedule, done: !this.hasPrev() } : schedule;
    }
    /**
     * Check if next suitable date exists
     *
     * @public
     * @return {Boolean}
     */
    hasNext() {
        const current = this._currentDate;
        const hasIterated = this._hasIterated;
        try {
            this.#findSchedule();
            return true;
        }
        catch (err) {
            return false;
        }
        finally {
            this._currentDate = current;
            this._hasIterated = hasIterated;
        }
    }
    /**
     * Check if previous suitable date exists
     *
     * @public
     * @return {Boolean}
     */
    hasPrev() {
        const current = this._currentDate;
        const hasIterated = this._hasIterated;
        try {
            this.#findSchedule(true);
            return true;
        }
        catch (err) {
            return false;
        }
        finally {
            this._currentDate = current;
            this._hasIterated = hasIterated;
        }
    }
    /**
     * Iterate over expression iterator
     *
     * @public
     * @param {number} steps Numbers of steps to iterate
     * @param {Function} callback Optional callback
     * @return {Array} Array of the iterated results
     */
    iterate(steps, callback) {
        const dates = [];
        const processStep = (step, action) => {
            try {
                const item = action();
                dates.push(item);
                // Fire the callback
                if (callback) {
                    callback(item, step);
                }
            }
            catch (err) {
                // Do nothing, as the loop will break on its own
            }
        };
        if (steps >= 0) {
            for (let i = 0; i < steps; i++) {
                processStep(i, () => this.next());
            }
        }
        else {
            for (let i = 0; i > steps; i--) {
                processStep(i, () => this.prev());
            }
        }
        return dates;
    }
    /**
     * Reset expression iterator state
     *
     * @public
     */
    reset(newDate) {
        this._currentDate = new date_1.CronDate(newDate || this._options.currentDate);
    }
    /**
     * Stringify the expression
     *
     * @public
     * @param {boolean} [includeSeconds] Should stringify seconds
     * @return {string}
     */
    stringify(includeSeconds = false) {
        return this.#fields.stringify(includeSeconds);
    }
    /**
     * Parse input expression (async)
     *
     * @public
     * @param {string} expression Input expression
     * @param {CronOptions} [options] Parsing options
     */
    static parse(expression, options = {}) {
        return CronExpressionParser_1.CronExpressionParser.parse(expression, options);
    }
    /**
     * Convert cron fields back to Cron Expression
     * @public
     * @param {Record<string, number[]>} fields Input fields
     * @param {CronOptions} [options] Parsing options
     * @return {CronExpression}
     */
    static fieldsToExpression(fields, options) {
        return new CronExpression(fields, options || {});
    }
    /**
     * Match field value
     *
     * @param {number} value
     * @param {number[]} sequence
     * @return {boolean}
     * @private
     */
    static #matchSchedule(value, sequence) {
        return sequence.some((element) => element === value);
    }
    /**
     * Helps determine if the provided date is the correct nth occurence of the
     * desired day of week.
     *
     * @param {CronDate} date
     * @param {number} nthDayOfWeek
     * @return {boolean}
     * @private
     */
    static #isNthDayMatch(date, nthDayOfWeek) {
        if (nthDayOfWeek >= 6) {
            return false;
        }
        const dayOfMonth = date.getDate();
        const occurrence = Math.floor((dayOfMonth - 1) / 7) + 1;
        return nthDayOfWeek === 1 ? dayOfMonth < 8 : occurrence === nthDayOfWeek;
    }
    /**
     * Helper function that checks if 'L' is in the array
     *
     * @param {Array} expressions
     */
    static #isLInExpressions(expressions) {
        return expressions.length > 0 && expressions.some(function (expression) {
            return typeof expression === 'string' && expression.indexOf('L') >= 0;
        });
    }
    static #isLastWeekdayOfMonthMatch(expressions, currentDate) {
        console.log('#### isLastWeekdayOfMonthMatch', expressions);
        return expressions.some(function (expression) {
            // There might be multiple expressions and not all of them will contain the "L".
            if (!CronExpression.#isLInExpressions([expression])) {
                return false;
            }
            // The first character represents the weekday
            const c = expression.toString().charAt(0);
            const weekday = parseInt(c) % 7;
            if (Number.isNaN(weekday)) {
                throw new Error('Invalid last weekday of the month expression: ' + expression);
            }
            return currentDate.getDay() === weekday && currentDate.isLastWeekdayOfMonth();
        });
    }
}
exports.CronExpression = CronExpression;
exports.default = CronExpression;
