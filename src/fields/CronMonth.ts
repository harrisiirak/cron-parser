import { CronField } from './CronField';
import { CronChars, CronMax, CronMin, MonthRange } from '../types';

const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MONTH_CHARS: readonly CronChars[] = Object.freeze([]);

const DAYS_IN_MONTH: readonly number[] =  Object.freeze([31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);

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

  static get chars(): readonly CronChars[] {
    return MONTH_CHARS;
  }

  static get daysInMonth(): readonly number[] {
    return DAYS_IN_MONTH;
  }

  /**
   * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
   * @param {MonthRange[]} values - Values for the "day of the month" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: MonthRange[], wildcard = false) {
    super(values, wildcard);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "day of the month" field.
   * @returns {MonthRange[]}
   */
  get values(): MonthRange[] {
    return super.values as MonthRange[];
  }
}
