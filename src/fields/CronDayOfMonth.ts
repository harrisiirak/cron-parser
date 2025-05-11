import { CronField, CronFieldOptions } from './CronField';
import { CronChars, CronMax, CronMin, DayOfMonthRange } from './types';

const MIN_DAY = 1;
const MAX_DAY = 31;
const DAY_CHARS = Object.freeze(['L']) as CronChars[];

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
    return /^[?,*\dLH/-]+$/;
  }
  /**
   * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
   * @param {DayOfMonthRange[]} values - Values for the "day of the month" field
   * @param {CronFieldOptions} [options] - Options provided by the parser
   * @throws {Error} if validation fails
   */
  constructor(values: DayOfMonthRange[], options?: CronFieldOptions) {
    super(values, options);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "day of the month" field.
   * @returns {DayOfMonthRange[]}
   */
  get values(): DayOfMonthRange[] {
    return super.values as DayOfMonthRange[];
  }
}
