import { CronField } from './CronField.js';
import { CronChars, CronMax, CronMin, MonthRange } from '../types.js';

const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MONTH_CHARS = [] as CronChars[];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Represents the "day of the month" field within a cron expression.
 * @class CronDayOfMonth
 * @extends CronField
 */
export class CronMonth extends CronField {
  static get min(): CronMin {
    return MIN_MONTH;
  }

  static get max(): CronMax {
    return MAX_MONTH;
  }

  static get chars(): CronChars[] {
    return MONTH_CHARS;
  }

  static get daysInMonth(): number[] {
    return DAYS_IN_MONTH;
  }

  /**
   * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
   * @param {DayOfTheMonthRange[]} values - Values for the "day of the month" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: MonthRange[], wildcard = false) {
    super(values, wildcard);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "day of the month" field.
   * @returns {DayOfTheMonthRange[]}
   */
  get values(): MonthRange[] {
    return super.values as MonthRange[];
  }
}
