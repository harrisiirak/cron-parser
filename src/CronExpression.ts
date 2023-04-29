import {CronExpressionParser} from './CronExpressionParser';
import {CronDate} from './CronDate';
import {CronFields} from './CronFields';
import assert from 'assert';
import {
  CronFieldTypes,
  DateMathOpEnum,
  DayOfTheMonthRange,
  DayOfTheWeekRange,
  HourRange,
  ICronFieldsParams,
  ICronParserOptions,
  IFieldConstraint,
  IIteratorCallback,
  IIteratorFields,
  MonthRange,
  PredefinedCronExpressionsEnum,
  SixtyRange,
  TimeUnitsEnum
} from './types';
import {DateTime} from 'luxon';
import debug from 'debug';
const debugMatcher = debug('cron-parser:CronExpression:matcher');

/**
 * Cron iteration loop safety limit
 */
const LOOP_LIMIT = 10000;

export class CronExpression {
  // FIXME: This should be a private property - but it's used in tests
  static map = ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  static #constraints: IFieldConstraint[] = [
    {min: 0, max: 59, chars: []}, // Second
    {min: 0, max: 59, chars: []}, // Minute
    {min: 0, max: 23, chars: []}, // Hour
    {min: 1, max: 31, chars: ['L']}, // Day of month
    {min: 1, max: 12, chars: []}, // Month
    {min: 0, max: 7, chars: ['L']}, // Day of week
  ];

  #options: ICronParserOptions;
  #utc: boolean;
  #tz: string | undefined;
  #currentDate: CronDate;
  #startDate: CronDate | null;
  #endDate: CronDate | null;
  #isIterator: boolean;
  #hasIterated: boolean;
  #nthDayOfWeek: number;
  #fields: CronFields;
  #expression?: string;

  constructor(fields: CronFields | ICronFieldsParams, options: ICronParserOptions) {
    this.#options = options;
    this.#utc = options.utc || false;
    this.#tz = this.#utc ? 'UTC' : options.tz;
    this.#currentDate = new CronDate(options.currentDate, this.#tz);
    this.#startDate = options.startDate ? new CronDate(options.startDate, this.#tz) : null;
    this.#endDate = options.endDate ? new CronDate(options.endDate, this.#tz) : null;
    this.#isIterator = options.iterator || false;
    this.#hasIterated = false;
    this.#nthDayOfWeek = options.nthDayOfWeek || 0;
    const {second, minute, hour, dayOfMonth, month, dayOfWeek} = fields;
    this.#fields = new CronFields({second, minute, hour, dayOfMonth, month, dayOfWeek});
    this.#expression = options.expression;
  }

  static get predefined() {
    return PredefinedCronExpressionsEnum;
  }

  get fields(): CronFields {
    return new CronFields(this.#fields);
  }

  /**
   * Parse input expression (async)
   *
   * @public
   * @param {string} expression Input expression
   * @param {CronOptions} [options] Parsing options
   */
  static parse(expression: string, options: ICronParserOptions = {}): CronExpression {
    return CronExpressionParser.parse(expression, options);
  }

  /**
   * Convert cron fields back to Cron Expression
   * @public
   * @param {Record<string, number[]>} fields Input fields
   * @param {CronOptions} [options] Parsing options
   * @return {CronExpression}
   */
  static fieldsToExpression(fields: CronFields, options?: ICronParserOptions): CronExpression {
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
  static #matchSchedule(value: number, sequence: CronFieldTypes): boolean {
    return sequence.some((element) => element === value);
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

  /**
   * Find next suitable date
   *
   * @public
   * @return {CronDate|Object}
   */
  next(): CronDate | { value: CronDate; done: boolean } {
    const schedule = this.#findSchedule();
    // Try to return ES6 compatible iterator
    return this.#isIterator ? {value: schedule, done: !this.hasNext()} : schedule;
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
    return this.#isIterator ? {value: schedule, done: !this.hasPrev()} : schedule;
  }

  // current(): CronDate | { value: CronDate; done: boolean } {
  //   if (this.#currentDate) {
  //     return this.#currentDate
  //   }
  //   throw new Error('Has not iterated!');
  // }

  /**
   * Check if next suitable date exists
   *
   * @public
   * @return {Boolean}
   */
  hasNext(): boolean {
    const current = this.#currentDate;
    const hasIterated = this.#hasIterated;

    try {
      this.#findSchedule();
      return true;
    } catch (err) {
      return false;
    } finally {
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
  hasPrev(): boolean {
    const current = this.#currentDate;
    const hasIterated = this.#hasIterated;

    try {
      this.#findSchedule(true);
      return true;
    } catch (err) {
      return false;
    } finally {
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
  iterate(steps: number, callback?: IIteratorCallback): (IIteratorFields | CronDate)[] {
    const dates: (IIteratorFields | CronDate)[] = [];

    const processStep = (step: number, action: () => IIteratorFields | CronDate) => {
      try {
        const item: IIteratorFields | CronDate = action();
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
  reset(newDate?: Date | CronDate): void {
    this.#currentDate = new CronDate(newDate || this.#options.currentDate);
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

  private matchMonth(currentDate: CronDate): boolean {
    if (!CronExpression.#matchSchedule(currentDate.getMonth() + 1, this.#fields.month.values)) {
      return false;
    }
    return true;
  }

  private matchDayOfMonth(currentDate: CronDate): boolean {
    const isDayOfMonthWildcardMatch = this.#fields.dayOfMonth.isWildcard;
    const isRestrictedDOM = !this.#fields.dayOfMonth.isWildcard;
    const isDayOfWeekWildcardMatch = this.#fields.dayOfWeek.isWildcard;
    const isRestrictedDOW = !this.#fields.dayOfWeek.isWildcard;

    let matchedDOM = CronExpression.#matchSchedule(currentDate.getDate(), this.#fields.dayOfMonth.values);
    let matchedDOW = CronExpression.#matchSchedule(currentDate.getDay(), this.#fields.dayOfWeek.values);

    if (CronExpression.#isLInExpressions(this.#fields.dayOfMonth.values)) {
      matchedDOM = matchedDOM || currentDate.isLastDayOfMonth();
    }
    if (CronExpression.#isLInExpressions(this.#fields.dayOfWeek.values)) {
      matchedDOW = matchedDOW || CronExpression.#isLastWeekdayOfMonthMatch(this.#fields.dayOfWeek.values, currentDate);
    }

    // Restricted = not wildcard (not contain "*" or "?")
    // Rule 1 - if both "day of month" and "day of week" are restricted, then one or both must match the current day.
    if (isRestrictedDOM && isRestrictedDOW && (matchedDOM || matchedDOW)) {
      debugMatcher(`ACCEPTED(matchDayOfMonth) - Rule 1: ${currentDate.toISOString()} - matchedDOM: ${matchedDOM}, matchedDOW: ${matchedDOW}, isRestrictedDOM: ${isRestrictedDOM} isRestrictedDOW: ${isRestrictedDOW}`);
      return true;
    }

    // Rule 2 - if "day of month" restricted and "day of week" not restricted, then "day of month" must match current day.
    if (matchedDOM && !isRestrictedDOW) {
      debugMatcher(`ACCEPTED(matchDayOfMonth) - Rule 2: ${currentDate.toISOString()} - matchedDOM: ${matchedDOM}, matchedDOW: ${matchedDOW}, isRestrictedDOM: ${isRestrictedDOM} isRestrictedDOW: ${isRestrictedDOW}`);
      return true;
    }

    if (!matchedDOM && (!matchedDOW || isDayOfWeekWildcardMatch)) {
      debugMatcher(`REJECTED(matchDayOfMonth) - Rule A: ${currentDate.toISOString()} - matchedDOM: ${matchedDOM}, matchedDOW: ${matchedDOW}, isRestrictedDOM: ${isRestrictedDOM} isRestrictedDOW: ${isRestrictedDOW}`);
      return false;
    }

    // if (!matchedDOW && (matchedDOM && !isDayOfMonthWildcardMatch)) {
    //   debugMatcher(`REJECTED(matchDayOfMonth) - Rule B: ${currentDate.toISOString()} - matchedDOM: ${matchedDOM}, matchedDOW: ${matchedDOW}, isRestrictedDOM: ${isRestrictedDOM} isRestrictedDOW: ${isRestrictedDOW}`);
    //   return false;
    // }
    //
    // if (!isDayOfMonthWildcardMatch && isDayOfWeekWildcardMatch && !matchedDOM) {
    //   debugMatcher(`REJECTED(matchDayOfMonth) - Rule C: ${currentDate.toISOString()} - matchedDOM: ${matchedDOM}, matchedDOW: ${matchedDOW}, isRestrictedDOM: ${isRestrictedDOM} isRestrictedDOW: ${isRestrictedDOW}`);
    //   return false;
    // }

    if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && !matchedDOW) {
      debugMatcher(`REJECTED(matchDayOfMonth) - Rule D: ${currentDate.toISOString()} - matchedDOM: ${matchedDOM}, matchedDOW: ${matchedDOW}, isRestrictedDOM: ${isRestrictedDOM} isRestrictedDOW: ${isRestrictedDOW}`);
      return false;
    }
    return true;
  }

  private matchNthDayOfWeek(currentDate: CronDate): boolean {
    return this.#nthDayOfWeek <= 0 || Math.ceil(currentDate.getDate() / 7) === this.#nthDayOfWeek;
  }

  private matchHour(currentDate: CronDate, dateMathVerb: DateMathOpEnum, reverse: boolean): boolean {
    const currentHour = currentDate.getHours();
    if (!CronExpression.#matchSchedule(currentHour, this.#fields.hour.values)) {
      if (currentDate.dstStart !== currentHour) {
        currentDate.dstStart = null;
        currentDate.shiftTimezone(dateMathVerb, TimeUnitsEnum.hour, this.#fields.hour.values.length);
        return false;
      } else if (!CronExpression.#matchSchedule(currentHour - 1, this.#fields.hour.values)) {
        currentDate.handleMathOp(dateMathVerb, TimeUnitsEnum.hour);
        return false;
      }
    } else if (currentDate.dstEnd === currentHour) {
      if (!reverse) {
        currentDate.dstEnd = null;
        currentDate.shiftTimezone(DateMathOpEnum.add, TimeUnitsEnum.hour, this.#fields.hour.values.length);
        return false;
      }
    }
    return true;
  }

  private matchMinute(currentDate: CronDate): boolean {
    if (!CronExpression.#matchSchedule(currentDate.getMinutes(), this.#fields.minute.values)) {
      return false;
    }
    return true;
  }

  private matchSecond(currentDate: CronDate): boolean {
    if (!CronExpression.#matchSchedule(currentDate.getSeconds(), this.#fields.second.values)) {
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
  #findSchedule(reverse = false): CronDate {
    const dateMathVerb: DateMathOpEnum = reverse ? DateMathOpEnum.subtract : DateMathOpEnum.add;
    const currentDate = new CronDate(this.#currentDate, this.#tz);
    const startDate = this.#startDate;
    const endDate = this.#endDate;
    const startTimestamp = currentDate.getTime();
    let stepCount = 0;

    while (stepCount++ < LOOP_LIMIT) {
      assert(stepCount < LOOP_LIMIT, 'Invalid expression, loop limit exceeded');
      assert(!reverse || !(startDate && (startDate.getTime() > currentDate.getTime())), 'Out of the timespan range');
      assert(reverse || !(endDate && (currentDate.getTime() > endDate.getTime())), 'Out of the timespan range');
      debugMatcher(`############## Start Of Match: ${currentDate.toISOString()} ##############`);

      if (!this.matchDayOfMonth(currentDate)) {
        currentDate.shiftTimezone(dateMathVerb, TimeUnitsEnum.day, this.#fields.hour.values.length);
        debugMatcher(`REJECT: matchDayOfMonth startTimestamp=${startTimestamp} currentDate=${currentDate.getTime()}`);
        continue;
      }
      if (!this.matchNthDayOfWeek(currentDate)) {
        currentDate.shiftTimezone(dateMathVerb, TimeUnitsEnum.day, this.#fields.hour.values.length);
        debugMatcher(`REJECT: matchNthDayOfWeek startTimestamp=${startTimestamp} currentDate=${currentDate.getTime()}`);
        continue;
      }
      if (!this.matchMonth(currentDate)) {
        currentDate.shiftTimezone(dateMathVerb, TimeUnitsEnum.month, this.#fields.hour.values.length);
        debugMatcher(`REJECT: matchMonth startTimestamp=${startTimestamp} currentDate=${currentDate.getTime()}`);
        continue;
      }
      if (!this.matchHour(currentDate, dateMathVerb, reverse)) {
        debugMatcher(`REJECT: matchHour startTimestamp=${startTimestamp} currentDate=${currentDate.getTime()}`);
        continue;
      }
      if (!this.matchMinute(currentDate)) {
        currentDate.shiftTimezone(dateMathVerb, TimeUnitsEnum.minute, this.#fields.hour.values.length);
        debugMatcher(`REJECT: matchMinute startTimestamp=${startTimestamp} currentDate=${currentDate.getTime()}`);
        continue;
      }
      if (!this.matchSecond(currentDate)) {
        currentDate.shiftTimezone(dateMathVerb, TimeUnitsEnum.second, this.#fields.hour.values.length);
        debugMatcher(`REJECT: matchSecond startTimestamp=${startTimestamp} currentDate=${currentDate.getTime()}`);
        continue;
      }

      if (startTimestamp === currentDate.getTime()) {
        debugMatcher(`REJECT: startTimestamp === currentDate.getTime() startTimestamp=${startTimestamp} currentDate=${currentDate.getTime()}`);
        if ((dateMathVerb === 'add') || (currentDate.getMilliseconds() === 0)) {
          currentDate.shiftTimezone(dateMathVerb, TimeUnitsEnum.second, this.#fields.hour.values.length);
        } else {
          currentDate.setMilliseconds(0);
        }
        continue;
      }
      break;
    }

    this.#currentDate = new CronDate(currentDate, this.#tz);
    this.#hasIterated = true;
    debugMatcher(`************** MATCHED: ${this.#currentDate.toISOString()} **************`);
    return currentDate;
  }

  /**
   * Check if the cron expression includes the given date
   * @param {Date|CronDate} date
   */
  includesDate(date: Date | CronDate): boolean {
    const {second, minute, hour, dayOfMonth, month, dayOfWeek} = this.#fields;
    const dtStr = date.toISOString();
    assert(dtStr != null, 'Invalid date');
    const dt = DateTime.fromISO(dtStr, {zone: this.#tz});
    return (
      dayOfMonth.values.includes(<DayOfTheMonthRange>dt.day)
      && dayOfWeek.values.includes(<DayOfTheWeekRange>dt.weekday)
      && month.values.includes(<MonthRange>dt.month)
      && hour.values.includes(<HourRange>dt.hour)
      && minute.values.includes(<SixtyRange>dt.minute)
      && second.values.includes(<SixtyRange>dt.second)
    );
  }

  toString(): string {
    return this.#expression || this.stringify(true);
  }
}

export default CronExpression;
