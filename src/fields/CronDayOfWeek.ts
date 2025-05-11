import { CronField, CronFieldOptions } from './CronField';
import { CronChars, CronMax, CronMin, DayOfWeekRange } from './types';

const MIN_DAY = 0;
const MAX_DAY = 7;
const DAY_CHARS: readonly CronChars[] = Object.freeze(['L']);

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
    return /^[?,*\dLH#/-]+$/;
  }

  /**
   * CronDayOfTheWeek constructor. Initializes the "day of the week" field with the provided values.
   * @param {DayOfWeekRange[]} values - Values for the "day of the week" field
   * @param {CronFieldOptions} [options] - Options provided by the parser
   */
  constructor(values: DayOfWeekRange[], options?: CronFieldOptions) {
    super(values, options);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "day of the week" field.
   * @returns {DayOfWeekRange[]}
   */
  get values(): DayOfWeekRange[] {
    return super.values as DayOfWeekRange[];
  }

  /**
   * Returns the nth day of the week if specified in the cron expression.
   * This is used for the '#' character in the cron expression.
   * @returns {number} The nth day of the week (1-5) or 0 if not specified.
   */
  get nthDay(): number {
    return this.options.nthDayOfWeek ?? 0;
  }
}
