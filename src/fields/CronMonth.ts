import { DAYS_IN_MONTH } from '../CronDate';
import { CronField, CronFieldOptions } from './CronField';
import { CronChars, CronMax, CronMin, MonthRange } from './types';

const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MONTH_CHARS: readonly CronChars[] = Object.freeze([]);

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
   * @param {CronFieldOptions} [options] - Options provided by the parser
   */
  constructor(values: MonthRange[], options?: CronFieldOptions) {
    super(values, options);
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
