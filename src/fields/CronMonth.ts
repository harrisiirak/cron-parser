import { CronField } from './CronField';
import { CronChars, MonthRange } from '../types';

const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MONTH_CHARS = [] as CronChars[];

/**
 * Represents the "day of the month" field within a cron expression.
 * @class CronDayOfMonth
 * @extends CronField
 */
export class CronMonth extends CronField {
  /**
   * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
   * @param {DayOfTheMonthRange[]} values - Values for the "day of the month" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: MonthRange[], wildcard = false) {
    super(values, MIN_MONTH, MAX_MONTH, MONTH_CHARS, wildcard);
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
