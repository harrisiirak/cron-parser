import { CronExpressionParser } from './CronExpressionParser.js';
import { CronDate } from './CronDate.js';
import { CronFields } from './CronFields.js';
import assert from 'assert';
import {
  CronFieldTypes,
  DateMathOp,
  DayOfTheMonthRange,
  DayOfTheWeekRange,
  HourRange,
  ICronExpression,
  ICronFields,
  ICronParseOptions,
  IIteratorCallback,
  IIteratorFields,
  MonthRange,
  SixtyRange,
  TimeUnits,
} from './types.js';
import { DateTime } from 'luxon';


/**
 * Cron iteration loop safety limit
 */
const LOOP_LIMIT = 10000;

/**
 * Class representing a Cron expression.
 */
export class CronExpression {
  #options: ICronParseOptions;
  readonly #utc: boolean;
  readonly #tz?: string;
  #currentDate: CronDate;
  readonly #startDate: CronDate | null;
  readonly #endDate: CronDate | null;
  readonly #isIterator: boolean;
  #hasIterated: boolean;
  readonly #nthDayOfWeek: number;
  readonly #fields: CronFields;

  /**
   * Creates a new CronExpression instance.
   *
   * @param {CronFields | ICronFields} fields - Cron fields.
   * @param {ICronExpression} options - Parser options.
   */
  constructor(fields: CronFields | ICronFields, options: ICronExpression) {
    this.#options = options;
    this.#utc = options.utc || false;
    this.#tz = this.#utc ? 'UTC' : options.tz;
    this.#currentDate = new CronDate(options.currentDate, this.#tz);
    this.#startDate = options.startDate ? new CronDate(options.startDate, this.#tz) : null;
    this.#endDate = options.endDate ? new CronDate(options.endDate, this.#tz) : null;
    this.#isIterator = options.iterator || false;
    this.#hasIterated = false;
    this.#nthDayOfWeek = options.nthDayOfWeek || 0;
    const { second, minute, hour, dayOfMonth, month, dayOfWeek } = fields;
    this.#fields = new CronFields({
      second,
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek,
    });
  }

  /**
   * Getter for the cron fields.
   *
   * @returns {CronFields} Cron fields.
   */
  get fields(): CronFields {
    return new CronFields(this.#fields);
  }

  /**
   * Asynchronously parses the input cron expression string.
   *
   * @public
   * @param {string} expression - The input cron expression string.
   * @param {ICronParseOptions} [options] - Optional parsing options.
   * @returns {CronExpression} - A new CronExpression instance.
   */
  static parse(expression: string, options: ICronParseOptions = {}): CronExpression {
    return CronExpressionParser.parse(expression, options);
  }

  /**
   * Converts cron fields back to a CronExpression instance.
   *
   * @public
   * @param {Record<string, number[]>} fields - The input cron fields object.
   * @param {ICronParseOptions} [options] - Optional parsing options.
   * @returns {CronExpression} - A new CronExpression instance.
   */
  static fieldsToExpression(fields: CronFields, options?: ICronExpression): CronExpression {
    return new CronExpression(fields, options || {});
  }

  /**
   * Checks if the given value matches any element in the sequence.
   *
   * @param {number} value - The value to be matched.
   * @param {number[]} sequence - The sequence to be checked against.
   * @returns {boolean} - True if the value matches an element in the sequence; otherwise, false.
   * @memberof CronExpression
   * @private
   */
  static #matchSchedule(value: number, sequence: CronFieldTypes): boolean {
    return sequence.some((element) => element === value);
  }

  /**
   * Checks if the 'L' character is present in any of the given expressions.
   *
   * @param {Array} expressions - An array of expressions to be checked.
   * @returns {boolean} - True if the 'L' character is present in any of the expressions; otherwise, false.
   * @memberof CronExpression
   * @private
   */
  static #isLInExpressions(expressions: (number | string)[]): boolean {
    return (
      expressions.length > 0 &&
      expressions.some((expression: number | string) => {
        return typeof expression === 'string' && expression.indexOf('L') >= 0;
      })
    );
  }

  /**
   * Determines if the current date matches the last specified weekday of the month.
   *
   * @param {Array<(number|string)>} expressions - An array of expressions containing weekdays and "L" for the last weekday.
   * @param {CronDate} currentDate - The current date object.
   * @returns {boolean} - True if the current date matches the last specified weekday of the month; otherwise, false.
   * @memberof CronExpression
   * @private
   */
  static #isLastWeekdayOfMonthMatch(expressions: (number | string)[], currentDate: CronDate): boolean {
    return expressions.some((expression: number | string) => {
      // There might be multiple expressions and not all of them will contain the "L".
      if (!CronExpression.#isLInExpressions([expression])) {
        return false;
      }

      // The first character represents the weekday
      const weekday = parseInt(expression.toString().charAt(0), 10) % 7;
      assert(!Number.isNaN(weekday), `Invalid last weekday of the month expression: ${expression}`);

      // Check if the current date matches the last specified weekday of the month
      return currentDate.getDay() === weekday && currentDate.isLastWeekdayOfMonth();
    });
  }

  /**
   * Find the next scheduled date based on the cron expression.
   * @returns {CronDate | { value: CronDate; done: boolean }} - The next scheduled date or an ES6 compatible iterator object.
   * @memberof CronExpression
   * @public
   */
  next(): CronDate | { value: CronDate; done: boolean } {
    const schedule = this.#findSchedule();
    // Try to return ES6 compatible iterator
    return this.#isIterator ? { value: schedule, done: !this.hasNext() } : schedule;
  }

  /**
   * Find the previous scheduled date based on the cron expression.
   * @returns {CronDate | { value: CronDate; done: boolean }} - The previous scheduled date or an ES6 compatible iterator object.
   * @memberof CronExpression
   * @public
   */
  prev(): CronDate | { value: CronDate; done: boolean } {
    const schedule = this.#findSchedule(true);
    // Try to return ES6 compatible iterator
    // TODO: this needs to be refactored into a real iterator
    /* istanbul ignore next - no idea how to trigger first branch */
    return this.#isIterator ? { value: schedule, done: !this.hasPrev() } : schedule;
  }

  /**
   * Check if there is a next scheduled date based on the current date and cron expression.
   * @returns {boolean} - Returns true if there is a next scheduled date, false otherwise.
   * @memberof CronExpression
   * @public
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
   * Check if there is a previous scheduled date based on the current date and cron expression.
   * @returns {boolean} - Returns true if there is a previous scheduled date, false otherwise.
   * @memberof CronExpression
   * @public
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
   * Iterate over a specified number of steps and optionally execute a callback function for each step.
   * @param {number} steps - The number of steps to iterate. Positive value iterates forward, negative value iterates backward.
   * @param {IIteratorCallback} [callback] - Optional callback function to be executed for each step.
   * @returns {(IIteratorFields | CronDate)[]} - An array of iterator fields or CronDate objects.
   * @memberof CronExpression
   * @public
   */
  iterate(steps: number, callback?: IIteratorCallback): (IIteratorFields | CronDate)[] {
    const dates: (IIteratorFields | CronDate)[] = [];

    /**
     * Process each step and execute the action function.
     * @param {number} step - The current step number.
     * @param {() => IIteratorFields | CronDate} action - The action function to be executed for the current step.
     */
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
   * Reset the iterators current date to a new date or the initial date.
   * @param {Date | CronDate} [newDate] - Optional new date to reset to. If not provided, it will reset to the initial date.
   * @memberof CronExpression
   * @public
   */
  reset(newDate?: Date | CronDate): void {
    this.#currentDate = new CronDate(newDate || this.#options.currentDate);
  }

  /**
   * Generate a string representation of the cron expression.
   * @param {boolean} [includeSeconds=false] - Whether to include the seconds field in the string representation.
   * @returns {string} - The string representation of the cron expression.
   * @memberof CronExpression
   * @public
   */
  stringify(includeSeconds = false) {
    return this.#fields.stringify(includeSeconds);
  }

  /**
   * Check if the cron expression includes the given date
   * @param {Date|CronDate} date
   * @returns {boolean}
   */
  includesDate(date: Date | CronDate): boolean {
    const { second, minute, hour, dayOfMonth, month, dayOfWeek } = this.#fields;
    const dtStr = date.toISOString();
    assert(dtStr != null, 'Invalid date');
    const dt = DateTime.fromISO(dtStr, { zone: this.#tz });
    return (
      dayOfMonth.values.includes(<DayOfTheMonthRange>dt.day) &&
      dayOfWeek.values.includes(<DayOfTheWeekRange>dt.weekday) &&
      month.values.includes(<MonthRange>dt.month) &&
      hour.values.includes(<HourRange>dt.hour) &&
      minute.values.includes(<SixtyRange>dt.minute) &&
      second.values.includes(<SixtyRange>dt.second)
    );
  }

  /**
   * Returns the string representation of the cron expression.
   * @returns {CronDate} - The next schedule date.
   */
  toString(): string {
    /* istanbul ignore next - should be impossible under normal use to trigger the or branch */
    return this.#options.expression || this.stringify(true);
  }

  /**
   * Determines if the given date matches the cron expression's day of month and day of week fields.
   *
   * The function checks the following rules:
   * Rule 1: If both "day of month" and "day of week" are restricted (not wildcard), then one or both must match the current day.
   * Rule 2: If "day of month" is restricted and "day of week" is not restricted, then "day of month" must match the current day.
   * Rule 3: If "day of month" is a wildcard, "day of week" is not a wildcard, and "day of week" matches the current day, then the match is accepted.
   * If none of the rules match, the match is rejected.
   *
   * @param {CronDate} currentDate - The current date to be evaluated against the cron expression.
   * @returns {boolean} Returns true if the current date matches the cron expression's day of month and day of week fields, otherwise false.
   * @memberof CronExpression
   * @private
   */
  #matchDayOfMonth(currentDate: CronDate): boolean {
    // Check if day of month and day of week fields are wildcards or restricted (not wildcard).
    const isDayOfMonthWildcardMatch = this.#fields.dayOfMonth.isWildcard;
    const isRestrictedDOM = !isDayOfMonthWildcardMatch;
    const isDayOfWeekWildcardMatch = this.#fields.dayOfWeek.isWildcard;
    const isRestrictedDOW = !isDayOfWeekWildcardMatch;

    // Calculate if the current date matches the day of month and day of week fields.
    const matchedDOM =
      CronExpression.#matchSchedule(currentDate.getDate(), this.#fields.dayOfMonth.values) ||
      (CronExpression.#isLInExpressions(this.#fields.dayOfMonth.values) && currentDate.isLastDayOfMonth());
    const matchedDOW =
      CronExpression.#matchSchedule(currentDate.getDay(), this.#fields.dayOfWeek.values) ||
      (CronExpression.#isLInExpressions(this.#fields.dayOfWeek.values) &&
        CronExpression.#isLastWeekdayOfMonthMatch(this.#fields.dayOfWeek.values, currentDate));

    // Rule 1: Both "day of month" and "day of week" are restricted; one or both must match the current day.
    if (isRestrictedDOM && isRestrictedDOW && (matchedDOM || matchedDOW)) {
      return true;
    }

    // Rule 2: "day of month" restricted and "day of week" not restricted; "day of month" must match the current day.
    if (matchedDOM && !isRestrictedDOW) {
      return true;
    }

    // Rule 3: "day of month" is a wildcard, "day of week" is not a wildcard, and "day of week" matches the current day.
    if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && matchedDOW) {
      return true;
    }

    // If none of the rules match, the match is rejected.
    return false;
  }

  /**
   * Determines if the current hour matches the cron expression.
   *
   * @param {CronDate} currentDate - The current date object.
   * @param {DateMathOp} dateMathVerb - The date math operation enumeration value.
   * @param {boolean} reverse - A flag indicating whether the matching should be done in reverse order.
   * @returns {boolean} - True if the current hour matches the cron expression; otherwise, false.
   */
  #matchHour(currentDate: CronDate, dateMathVerb: DateMathOp, reverse: boolean): boolean {
    const currentHour = currentDate.getHours();
    const isMatch = CronExpression.#matchSchedule(currentHour, this.#fields.hour.values);
    const isDstStart = currentDate.dstStart === currentHour;
    const isDstEnd = currentDate.dstEnd === currentHour;

    if (!isMatch && !isDstStart) {
      currentDate.dstStart = null;
      currentDate.applyDateOperation(dateMathVerb, TimeUnits.Hour, this.#fields.hour.values.length);
      return false;
    }
    if (isDstStart && !CronExpression.#matchSchedule(currentHour - 1, this.#fields.hour.values)) {
      currentDate.invokeDateOperation(dateMathVerb, TimeUnits.Hour);
      return false;
    }
    if (isDstEnd && !reverse) {
      currentDate.dstEnd = null;
      currentDate.applyDateOperation(DateMathOp.Add, TimeUnits.Hour, this.#fields.hour.values.length);
      return false;
    }
    return true;
  }

  /**
   * Finds the next or previous schedule based on the cron expression.
   *
   * @param {boolean} [reverse=false] - If true, finds the previous schedule; otherwise, finds the next schedule.
   * @returns {CronDate} - The next or previous schedule date.
   * @private
   */
  #findSchedule(reverse = false): CronDate {
    const dateMathVerb: DateMathOp = reverse ? DateMathOp.Subtract : DateMathOp.Add;
    const currentDate = new CronDate(this.#currentDate, this.#tz);
    const startDate = this.#startDate;
    const endDate = this.#endDate;
    const startTimestamp = currentDate.getTime();
    let stepCount = 0;

    while (stepCount++ < LOOP_LIMIT) {
      assert(stepCount < LOOP_LIMIT, 'Invalid expression, loop limit exceeded');
      assert(!reverse || !(startDate && startDate.getTime() > currentDate.getTime()), 'Out of the timespan range');
      assert(reverse || !(endDate && currentDate.getTime() > endDate.getTime()), 'Out of the timespan range');

      if (!this.#matchDayOfMonth(currentDate)) {
        currentDate.applyDateOperation(dateMathVerb, TimeUnits.Day, this.#fields.hour.values.length);
        continue;
      }
      if (!(this.#nthDayOfWeek <= 0 || Math.ceil(currentDate.getDate() / 7) === this.#nthDayOfWeek)) {
        currentDate.applyDateOperation(dateMathVerb, TimeUnits.Day, this.#fields.hour.values.length);
        continue;
      }
      if (!CronExpression.#matchSchedule(currentDate.getMonth() + 1, this.#fields.month.values)) {
        currentDate.applyDateOperation(dateMathVerb, TimeUnits.Month, this.#fields.hour.values.length);
        continue;
      }
      if (!this.#matchHour(currentDate, dateMathVerb, reverse)) {
        continue;
      }
      if (!CronExpression.#matchSchedule(currentDate.getMinutes(), this.#fields.minute.values)) {
        currentDate.applyDateOperation(dateMathVerb, TimeUnits.Minute, this.#fields.hour.values.length);
        continue;
      }
      if (!CronExpression.#matchSchedule(currentDate.getSeconds(), this.#fields.second.values)) {
        currentDate.applyDateOperation(dateMathVerb, TimeUnits.Second, this.#fields.hour.values.length);
        continue;
      }

      if (startTimestamp === currentDate.getTime()) {
        if (dateMathVerb === 'Add' || currentDate.getMilliseconds() === 0) {
          currentDate.applyDateOperation(dateMathVerb, TimeUnits.Second, this.#fields.hour.values.length);
        } else {
          currentDate.setMilliseconds(0);
        }
        continue;
      }
      break;
    }

    this.#currentDate = new CronDate(currentDate, this.#tz);
    this.#hasIterated = true;
    return currentDate;
  }
}

export default CronExpression;
