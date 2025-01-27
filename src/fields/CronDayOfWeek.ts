import { CronField } from './CronField';
import { CronChars, CronMax, CronMin, DayOfWeekRange } from './types';

const MIN_DAY = 0;
const MAX_DAY = 7;
const DAY_CHARS: readonly CronChars[] = Object.freeze(['L']) ;

/**
 * Represents the "day of the week" field within a cron expression.
 * @class CronDayOfTheWeek
 * @extends CronField
 */
export class CronDayOfWeek extends CronField {
  static get min(): CronMin {
    return MIN_DAY;
  }

  static get max(): CronMax {
    return MAX_DAY;
  }

  static get chars(): readonly CronChars[] {
    return DAY_CHARS;
  }

  static get validChars(): RegExp {
    return /^[?,*\dL#/-]+$/;
  }

  /**
   * CronDayOfTheWeek constructor. Initializes the "day of the week" field with the provided values.
   * @param {DayOfWeekRange[]} values - Values for the "day of the week" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: DayOfWeekRange[], wildcard = false) {
    super(values, wildcard);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "day of the week" field.
   * @returns {DayOfWeekRange[]}
   */
  get values(): DayOfWeekRange[] {
    return super.values as DayOfWeekRange[];
  }
}
