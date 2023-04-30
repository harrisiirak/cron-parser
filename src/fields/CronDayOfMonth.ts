import {CronField} from './CronField';
import {CronChars, DayOfTheMonthRange} from '../types';

const MIN_DAY = 1;
const MAX_DAY = 31;
const DAY_CHARS = ['L'] as CronChars[];

/**
 * Represents the "day of the month" field within a cron expression.
 * @class CronDayOfMonth
 * @extends CronField
 */
export class CronDayOfMonth extends CronField {
  /**
   * Returns an array of allowed values for the "day of the month" field.
   * @returns {DayOfTheMonthRange[]}
   */
  get values(): DayOfTheMonthRange[] {
    return super.values as DayOfTheMonthRange[];
  }
  /**
   * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
   * @param {DayOfTheMonthRange[]} values - Values for the "day of the month" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   * @throws {Error} if validation fails
   */
  constructor(values: DayOfTheMonthRange[], wildcard = false) {
    super(values, MIN_DAY, MAX_DAY, DAY_CHARS, wildcard);
    this.validate();
  }
}
