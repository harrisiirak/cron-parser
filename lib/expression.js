"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronExpression = void 0;
const CronConstants_1 = require("./CronConstants");
const CronExpressionParser_1 = require("./CronExpressionParser");
const date_1 = require("./date");
const CronFields_1 = require("./CronFields");
const assert_1 = __importDefault(require("assert"));
const types_1 = require("./types");
/**
 * Cron iteration loop safety limit
 */
const LOOP_LIMIT = 10000;
class CronExpression {
    // FIXME: This should be a private property - but it's used in tests
    static map = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
    static #constraints = [
        { min: 0, max: 59, chars: [] },
        { min: 0, max: 59, chars: [] },
        { min: 0, max: 23, chars: [] },
        { min: 1, max: 31, chars: ['L'] },
        { min: 1, max: 12, chars: [] },
        { min: 0, max: 7, chars: ['L'] }, // Day of week
    ];
    #options;
    #utc;
    #tz;
    #currentDate;
    #startDate;
    #endDate;
    #isIterator;
    #hasIterated;
    #nthDayOfWeek;
    #dstStart = null;
    #dstEnd = null;
    #fields;
    get fields() {
        return new CronFields_1.CronFields(this.#fields);
    }
    constructor(fields, options) {
        this.#options = options;
        this.#utc = options.utc || false;
        this.#tz = this.#utc ? 'UTC' : options.tz;
        this.#currentDate = new date_1.CronDate(options.currentDate, this.#tz);
        this.#startDate = options.startDate ? new date_1.CronDate(options.startDate, this.#tz) : null;
        this.#endDate = options.endDate ? new date_1.CronDate(options.endDate, this.#tz) : null;
        this.#isIterator = options.iterator || false;
        this.#hasIterated = false;
        this.#nthDayOfWeek = options.nthDayOfWeek || 0;
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
                    this.#dstStart = currentHour;
                }
            }
            else if (diff === 0 && currentDate.getMinutes() === 0 && currentDate.getSeconds() === 0) {
                if (this.#fields.hour.length !== 24) {
                    this.#dstEnd = currentHour;
                }
            }
        }
    }
    ;
    matchMonth(currentDate, dateMathVerb) {
        if (!CronExpression.#matchSchedule(currentDate.getMonth() + 1, this.#fields.month)) {
            this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.month);
            return false;
        }
        return true;
    }
    // private matchDay(currentDate: CronDate, dateMathVerb: DateMathOpEnum): boolean {
    //     let dayOfMonthMatch = CronExpression.#matchSchedule(currentDate.getDate(), this.#fields.dayOfMonth);
    //     if (CronExpression.#isLInExpressions(this.#fields.dayOfMonth)) {
    //         dayOfMonthMatch = dayOfMonthMatch || currentDate.isLastDayOfMonth();
    //     }
    //     let dayOfWeekMatch = CronExpression.#matchSchedule(currentDate.getDay(), this.#fields.dayOfWeek);
    //     if (CronExpression.#isLInExpressions(this.#fields.dayOfWeek)) {
    //         dayOfWeekMatch = dayOfWeekMatch || CronExpression.#isLastWeekdayOfMonthMatch(this.#fields.dayOfWeek, currentDate);
    //     }
    //     const isDayOfMonthWildcardMatch = this.#fields.dayOfMonth.length >= CronConstants.daysInMonth[currentDate.getMonth()];
    //     const isDayOfWeekWildcardMatch = this.#fields.dayOfWeek.length === CronExpression.#constraints[5].max - CronExpression.#constraints[5].min + 1;
    //     const currentHour = currentDate.getHours();
    //
    //     if (!dayOfMonthMatch && (!dayOfWeekMatch || isDayOfWeekWildcardMatch)) {
    //         this.#applyTimezoneShift(currentDate, dateMathVerb, TimeUnitsEnum.day);
    //         return false;
    //     }
    //
    //     if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !dayOfMonthMatch) {
    //         this.#applyTimezoneShift(currentDate, dateMathVerb, TimeUnitsEnum.day);
    //         return false;
    //     }
    //
    //     if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !dayOfWeekMatch) {
    //         this.#applyTimezoneShift(currentDate, dateMathVerb, TimeUnitsEnum.day);
    //         return false;
    //     }
    //
    //     if (this.#nthDayOfWeek > 0 && !CronExpression.#isNthDayMatch(currentDate, this.#nthDayOfWeek)) {
    //         this.#applyTimezoneShift(currentDate, dateMathVerb, TimeUnitsEnum.day);
    //         return false;
    //     }
    //
    //     if (!CronExpression.#matchSchedule(currentDate.getMonth() + 1, this.#fields.month)) {
    //         this.#applyTimezoneShift(currentDate, dateMathVerb, TimeUnitsEnum.month);
    //         return false;
    //     }
    //     return true;
    // }
    matchDayOfMonth(currentDate, dateMathVerb) {
        let dayOfMonthMatch = CronExpression.#matchSchedule(currentDate.getDate(), this.#fields.dayOfMonth);
        if (CronExpression.#isLInExpressions(this.#fields.dayOfMonth)) {
            dayOfMonthMatch = dayOfMonthMatch || currentDate.isLastDayOfMonth();
        }
        let dayOfWeekMatch = CronExpression.#matchSchedule(currentDate.getDay(), this.#fields.dayOfWeek);
        if (CronExpression.#isLInExpressions(this.#fields.dayOfWeek)) {
            dayOfWeekMatch = dayOfWeekMatch || CronExpression.#isLastWeekdayOfMonthMatch(this.#fields.dayOfWeek, currentDate);
        }
        const isDayOfMonthWildcardMatch = this.#fields.dayOfMonth.length >= CronConstants_1.CronConstants.daysInMonth[currentDate.getMonth()];
        const isDayOfWeekWildcardMatch = this.#fields.dayOfWeek.length === CronExpression.#constraints[5].max - CronExpression.#constraints[5].min + 1;
        if (!dayOfMonthMatch && (!dayOfWeekMatch || isDayOfWeekWildcardMatch)) {
            this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
            return false;
        }
        if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !dayOfMonthMatch) {
            this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
            return false;
        }
        if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !dayOfWeekMatch) {
            this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
            return false;
        }
        return true;
    }
    matchNthDayOfWeek(currentDate, dateMathVerb) {
        if (this.#nthDayOfWeek > 0 && !CronExpression.#isNthDayMatch(currentDate, this.#nthDayOfWeek)) {
            this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.day);
            return false;
        }
        return true;
    }
    matchHour(currentDate, dateMathVerb, reverse) {
        const currentHour = currentDate.getHours();
        if (!CronExpression.#matchSchedule(currentHour, this.#fields.hour)) {
            if (this.#dstStart !== currentHour) {
                this.#dstStart = null;
                this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.hour);
                return false;
            }
            else if (!CronExpression.#matchSchedule(currentHour - 1, this.#fields.hour)) {
                currentDate.handleMathOp(dateMathVerb, types_1.TimeUnitsEnum.hour);
                return false;
            }
        }
        else if (this.#dstEnd === currentHour) {
            if (!reverse) {
                this.#dstEnd = null;
                this.#applyTimezoneShift(currentDate, types_1.DateMathOpEnum.add, types_1.TimeUnitsEnum.hour);
                return false;
            }
        }
        return true;
    }
    matchMinute(currentDate, dateMathVerb) {
        if (!CronExpression.#matchSchedule(currentDate.getMinutes(), this.#fields.minute)) {
            this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.minute);
            return false;
        }
        return true;
    }
    matchSecond(currentDate, dateMathVerb) {
        if (!CronExpression.#matchSchedule(currentDate.getSeconds(), this.#fields.second)) {
            this.#applyTimezoneShift(currentDate, dateMathVerb, types_1.TimeUnitsEnum.second);
            return false;
        }
        return true;
    }
    /**
     * Find next or previous matching schedule date
     * @param {boolean} [reverse=false] - Whether to search in reverse direction
     * @return {CronDate}
     * @private
     */
    #findSchedule(reverse = false) {
        const dateMathVerb = reverse ? types_1.DateMathOpEnum.subtract : types_1.DateMathOpEnum.add;
        const currentDate = new date_1.CronDate(this.#currentDate, this.#tz);
        const startDate = this.#startDate;
        const endDate = this.#endDate;
        const startTimestamp = currentDate.getTime();
        let stepCount = 0;
        while (true) {
            (0, assert_1.default)(stepCount++ < LOOP_LIMIT, 'Invalid expression, loop limit exceeded');
            (0, assert_1.default)(!reverse || !(startDate && (startDate.getTime() > currentDate.getTime())), 'Out of the timespan range');
            (0, assert_1.default)(reverse || !(endDate && (currentDate.getTime() > endDate.getTime())), 'Out of the timespan range');
            if (!this.matchDayOfMonth(currentDate, dateMathVerb))
                continue;
            if (!this.matchNthDayOfWeek(currentDate, dateMathVerb))
                continue;
            if (!this.matchMonth(currentDate, dateMathVerb))
                continue;
            if (!this.matchHour(currentDate, dateMathVerb, reverse))
                continue;
            if (!this.matchMinute(currentDate, dateMathVerb))
                continue;
            if (!this.matchSecond(currentDate, dateMathVerb))
                continue;
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
        this.#currentDate = new date_1.CronDate(currentDate, this.#tz);
        this.#hasIterated = true;
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
        return this.#isIterator ? { value: schedule, done: !this.hasNext() } : schedule;
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
        return this.#isIterator ? { value: schedule, done: !this.hasPrev() } : schedule;
    }
    /**
     * Check if next suitable date exists
     *
     * @public
     * @return {Boolean}
     */
    hasNext() {
        const current = this.#currentDate;
        const hasIterated = this.#hasIterated;
        try {
            this.#findSchedule();
            return true;
        }
        catch (err) {
            return false;
        }
        finally {
            this.#currentDate = current;
            this.#hasIterated = hasIterated;
        }
    }
    /**
     * Check if previous suitable date exists
     *
     * @public
     * @return {Boolean}
     */
    hasPrev() {
        const current = this.#currentDate;
        const hasIterated = this.#hasIterated;
        try {
            this.#findSchedule(true);
            return true;
        }
        catch (err) {
            return false;
        }
        finally {
            this.#currentDate = current;
            this.#hasIterated = hasIterated;
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
        this.#currentDate = new date_1.CronDate(newDate || this.#options.currentDate);
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
    static get predefined() {
        return types_1.PredefinedCronExpressionsEnum;
    }
}
exports.CronExpression = CronExpression;
exports.default = CronExpression;
