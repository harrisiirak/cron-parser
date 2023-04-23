import {CronExpressionParser} from "./CronExpressionParser";
import {CronDate, TimeUnit, DateMathOp} from './date';
import {DayOfTheMonthRange, DayOfTheWeekRange, HourRange, MonthRange, SixtyRange} from "../types";
import {CronFields} from "./CronFields";
import assert from "assert";

/**
 * Cron iteration loop safety limit
 */
const LOOP_LIMIT = 10000;

interface CronParserOptions {
    currentDate?: Date | string | number | CronDate; // FIXME: Should date be one of the types?
    endDate?: Date | string | number;
    startDate?: Date | string | number;
    iterator?: boolean;
    utc?: boolean;
    tz?: string;
    nthDayOfWeek?: number;
}

interface CronConstraints {
    min: number;
    max: number;
    chars: string[];

}

interface FieldConstraints {
    min: number;
    max: number;
    chars: string[];
}

type CronFieldTypes = SixtyRange[] | HourRange[] | DayOfTheMonthRange[] | MonthRange[] | DayOfTheWeekRange[];

export interface MappedFields {
    second: SixtyRange[];
    minute: SixtyRange[];
    hour: HourRange[];
    dayOfMonth: DayOfTheMonthRange[];
    month: MonthRange[];
    dayOfWeek: DayOfTheWeekRange[];
}

interface IteratorFields {
    value: CronDate;
    done: boolean;
}

type IteratorResult = Iterator<IteratorFields>;
type IteratorCallback = (item: IteratorFields | CronDate, index: number) => void;

enum MonthsEnum {jan = 1, feb = 2, mar = 3, apr = 4, may = 5, jun = 6, jul = 7, aug = 8, sep = 9, oct = 10, nov = 11, dec = 12};

enum DayOfWeekEnum {sun = 0, mon = 1, tue = 2, wed = 3, thu = 4, fri = 5, sat = 6};
type KeyValueType = { [key: string]: number };
type MonthsType = { [key: string]: MonthsEnum };
type DayOfWeekType = { [key: string]: DayOfWeekEnum };
type AliasesType = {
    month: MonthsType;
    dayOfWeek: DayOfWeekType;
};


enum DayOfWeek {sun = 0, mon = 1, tue = 2, wed = 3, thu = 4, fri = 5, sat = 6}

export class CronExpression {
    private static map = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
    private static predefined = {
        '@yearly': '0 0 1 1 *',
        '@monthly': '0 0 1 * *',
        '@weekly': '0 0 * * 0',
        '@daily': '0 0 * * *',
        '@hourly': '0 * * * *'
    };
    private static constraints: FieldConstraints[] = [
        {min: 0, max: 59, chars: []}, // Second
        {min: 0, max: 59, chars: []}, // Minute
        {min: 0, max: 23, chars: []}, // Hour
        {min: 1, max: 31, chars: ['L']}, // Day of month
        {min: 1, max: 12, chars: []}, // Month
        {min: 0, max: 7, chars: ['L']}, // Day of week
    ];
    private static daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    private static aliases: AliasesType = {
        month: {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12},
        dayOfWeek: {sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6}
    };
    private static parseDefaults = ['0', '*', '*', '*', '*', '*'];
    private static standardValidCharacters = /^[,*\d/-]+$/;
    private static dayOfWeekValidCharacters = /^[?,*\dL#/-]+$/;
    private static dayOfMonthValidCharacters = /^[?,*\dL/-]+$/;
    private static validCharacters = {
        second: CronExpression.standardValidCharacters,
        minute: CronExpression.standardValidCharacters,
        hour: CronExpression.standardValidCharacters,
        dayOfMonth: CronExpression.dayOfMonthValidCharacters,
        month: CronExpression.standardValidCharacters,
        dayOfWeek: CronExpression.dayOfWeekValidCharacters,
    };

    private _options: CronParserOptions;
    private _utc: boolean;
    private _tz: string | undefined;
    private _currentDate: CronDate;
    private _startDate: CronDate | null;
    private _endDate: CronDate | null;
    private _isIterator: boolean;
    private _hasIterated: boolean;
    private _nthDayOfWeek: number;
    private _dstStart: number | null = null;
    private _dstEnd: number | null = null;
    #fields: any;

    get fields(): CronFields {
        return new CronFields(this.#fields);
    }

    constructor(fields: CronFields, options: CronParserOptions) {
        this._options = options;
        this._utc = options.utc || false;
        this._tz = this._utc ? 'UTC' : options.tz;
        this._currentDate = new CronDate(options.currentDate, this._tz);
        this._startDate = options.startDate ? new CronDate(options.startDate, this._tz) : null;
        this._endDate = options.endDate ? new CronDate(options.endDate, this._tz) : null;
        this._isIterator = options.iterator || false;
        this._hasIterated = false;
        this._nthDayOfWeek = options.nthDayOfWeek || 0;
        this.#fields = new CronFields(fields);
    }

    #applyTimezoneShift(currentDate: CronDate, dateMathOp: DateMathOp, unit: TimeUnit): void {
        if (unit === 'Month' || unit === 'Day') {
            const prevTime = currentDate.getTime();
            // using a CronDate[key]() is tricky in ts, we will use a new function to do the same thing
            currentDate.handleMathOp(dateMathOp, unit);
            const currTime = currentDate.getTime();
            if (prevTime === currTime) {
                if (currentDate.getMinutes() === 0 && currentDate.getSeconds() === 0) {
                    currentDate.addHour();
                } else if (currentDate.getMinutes() === 59 && currentDate.getSeconds() === 59) {
                    currentDate.subtractHour();
                }
            }
        } else {
            const previousHour = currentDate.getHours();
            currentDate.handleMathOp(dateMathOp, unit);
            const currentHour = currentDate.getHours();
            const diff = currentHour - previousHour;
            if (diff === 2) {
                if (this.#fields.hour.length !== 24) {
                    this._dstStart = currentHour;
                }
            } else if (diff === 0 && currentDate.getMinutes() === 0 && currentDate.getSeconds() === 0) {
                if (this.#fields.hour.length !== 24) {
                    this._dstEnd = currentHour;
                }
            }
        }
    };

    /**
     * Find next or previous matching schedule date
     *
     * @return {CronDate}
     * @private
     */
    #findSchedule(reverse?: boolean): CronDate {
        // Whether to use backwards directionality when searching
        reverse = reverse || false;
        const dateMathVerb: 'add' | 'subtract' = reverse ? 'subtract' : 'add';

        let currentDate = new CronDate(this._currentDate, this._tz);
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
            } else {
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
                this.#applyTimezoneShift(currentDate, dateMathVerb, 'Day');
                continue;
            }

            if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !dayOfMonthMatch) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, 'Day');
                continue;
            }

            if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !dayOfWeekMatch) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, 'Day');
                continue;
            }

            if (this._nthDayOfWeek > 0 && !CronExpression.#isNthDayMatch(currentDate, this._nthDayOfWeek)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, 'Day');
                continue;
            }

            if (!CronExpression.#matchSchedule(currentDate.getMonth() + 1, this.#fields.month)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, 'Month');
                continue;
            }

            if (!CronExpression.#matchSchedule(currentHour, this.#fields.hour)) {
                if (this._dstStart !== currentHour) {
                    this._dstStart = null;
                    this.#applyTimezoneShift(currentDate, dateMathVerb, 'Hour');
                    continue;
                } else if (!CronExpression.#matchSchedule(currentHour - 1, this.#fields.hour)) {
                    currentDate.handleMathOp(dateMathVerb, 'Hour');
                    continue;
                }
            } else if (this._dstEnd === currentHour) {
                if (!reverse) {
                    this._dstEnd = null;
                    this.#applyTimezoneShift(currentDate, 'add', 'Hour');
                    continue;
                }
            }

            if (!CronExpression.#matchSchedule(currentDate.getMinutes(), this.#fields.minute)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, 'Minute');
                continue;
            }

            if (!CronExpression.#matchSchedule(currentDate.getSeconds(), this.#fields.second)) {
                this.#applyTimezoneShift(currentDate, dateMathVerb, 'Second');
                continue;
            }

            if (startTimestamp === currentDate.getTime()) {
                if ((dateMathVerb === 'add') || (currentDate.getMilliseconds() === 0)) {
                    this.#applyTimezoneShift(currentDate, dateMathVerb, 'Second');
                } else {
                    currentDate.setMilliseconds(0);
                }

                continue;
            }

            break;
        }

        if (stepCount >= LOOP_LIMIT) {
            throw new Error('Invalid expression, loop limit exceeded');
        }

        this._currentDate = new CronDate(currentDate, this._tz);
        this._hasIterated = true;

        return currentDate;
    };


    /**
     * Find next suitable date
     *
     * @public
     * @return {CronDate|Object}
     */
    next(): CronDate | { value: CronDate; done: boolean } {
        const schedule = this.#findSchedule();

        // Try to return ES6 compatible iterator
        return this._isIterator ? {value: schedule, done: !this.hasNext()} : schedule;
    }

    /**
     * Find previous suitable date
     *
     * @public
     * @return {CronDate|Object}
     */
    prev(): CronDate | { value: CronDate; done: boolean } {
        const schedule = this.#findSchedule(true);
        // Try to return ES6 compatible iterator
        return this._isIterator ? {value: schedule, done: !this.hasPrev()} : schedule;
    }

    /**
     * Check if next suitable date exists
     *
     * @public
     * @return {Boolean}
     */
    hasNext(): boolean {
        const current = this._currentDate;
        const hasIterated = this._hasIterated;

        try {
            this.#findSchedule();
            return true;
        } catch (err) {
            return false;
        } finally {
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
    hasPrev(): boolean {
        const current = this._currentDate;
        const hasIterated = this._hasIterated;

        try {
            this.#findSchedule(true);
            return true;
        } catch (err) {
            return false;
        } finally {
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
    iterate(steps: number, callback?: IteratorCallback): (IteratorFields | CronDate)[] {
        const dates: (IteratorFields | CronDate)[] = [];

        const processStep = (step: number, action: () => IteratorFields | CronDate) => {
            try {
                const item: IteratorFields | CronDate = action();
                dates.push(item);

                // Fire the callback
                if (callback) {
                    callback(item, step);
                }
            } catch (err) {
                // Do nothing, as the loop will break on its own
            }
        };

        if (steps >= 0) {
            for (let i = 0; i < steps; i++) {
                processStep(i, () => this.next());
            }
        } else {
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
    reset(newDate?: Date): void {
        this._currentDate = new CronDate(newDate || this._options.currentDate);
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
    static parse(expression: string, options: CronParserOptions = {}): CronExpression {
        return CronExpressionParser.parse(expression, options);
    }

    /**
     * Convert cron fields back to Cron Expression
     * @public
     * @param {Record<string, number[]>} fields Input fields
     * @param {CronOptions} [options] Parsing options
     * @return {CronExpression}
     */
    static fieldsToExpression(fields: CronFields, options?: CronParserOptions): CronExpression {
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
    static #matchSchedule(value: number, sequence: number[]): boolean {
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
    static #isNthDayMatch(date: CronDate, nthDayOfWeek: number): boolean {
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
    static #isLInExpressions(expressions: (number | string)[]): boolean {
        return expressions.length > 0 && expressions.some(function (expression: number | string) {
            return typeof expression === 'string' && expression.indexOf('L') >= 0;
        });
    }

    static #isLastWeekdayOfMonthMatch(expressions: (number | string)[], currentDate: CronDate): boolean {
        console.log('#### isLastWeekdayOfMonthMatch', expressions);
        return expressions.some(function (expression: (number | string)) {
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

export default CronExpression;
