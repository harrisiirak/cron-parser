import { CronField } from './CronField.js';
import { CronChars, CronMax, CronMin, DayOfTheWeekRange } from '../types.js';

const MIN_DAY = 0;
const MAX_DAY = 7;
const DAY_CHARS = ['L'] as CronChars[];

/**
 * Represents the "day of the week" field within a cron expression.
 * @class CronDayOfTheWeek
 * @extends CronField
 */
export class CronDayOfTheWeek extends CronField {
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
    return /^[?,*\dL#/-]+$/;
  }

  /**
   * CronDayOfTheWeek constructor. Initializes the "day of the week" field with the provided values.
   * @param {DayOfTheWeekRange[]} values - Values for the "day of the week" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: DayOfTheWeekRange[], wildcard = false) {
    super(values, wildcard);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "day of the week" field.
   * @returns {DayOfTheWeekRange[]}
   */
  get values(): DayOfTheWeekRange[] {
    return super.values as DayOfTheWeekRange[];
  }
}
