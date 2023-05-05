import { CronField } from './CronField';
import { CronChars, CronMax, CronMin, DayOfTheMonthRange } from '../types';

const MIN_DAY = 1;
const MAX_DAY = 31;
const DAY_CHARS = ['L'] as CronChars[];

/**
 * Represents the "day of the month" field within a cron expression.
 * @class CronDayOfMonth
 * @extends CronField
 */
export class CronDayOfMonth extends CronField {
  static get min(): CronMin {
    return MIN_DAY;
  }

  static get max(): CronMax {
    return MAX_DAY;
  }

  static get chars(): CronChars[] {
    return DAY_CHARS;
  }
  static get validChars(): RegExp {
    return /^[?,*\dL/-]+$/;
  }
  /**
   * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
   * @param {DayOfTheMonthRange[]} values - Values for the "day of the month" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   * @throws {Error} if validation fails
   */
  constructor(values: DayOfTheMonthRange[], wildcard = false) {
    super(values, wildcard);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "day of the month" field.
   * @returns {DayOfTheMonthRange[]}
   */
  get values(): DayOfTheMonthRange[] {
    return super.values as DayOfTheMonthRange[];
  }
}
