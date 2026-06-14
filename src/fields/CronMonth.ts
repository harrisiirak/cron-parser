import { DAYS_IN_MONTH } from '../constants.js';
import { CronField, CronFieldOptions } from './CronField';
import { CronChars, CronMax, CronMin, MonthRange } from './types';

const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MONTH_CHARS: readonly CronChars[] = Object.freeze([]);

/**
 * Represents the "month" field within a cron expression.
 * @class CronMonth
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
   * CronMonth constructor. Initializes the "month" field with the provided values.
   * @param {MonthRange[]} values - Values for the "month" field
   * @param {CronFieldOptions} [options] - Options provided by the parser
   */
  constructor(values: MonthRange[], options?: CronFieldOptions) {
    super(values, options);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "month" field.
   * @returns {MonthRange[]}
   */
  get values(): MonthRange[] {
    return super.values as MonthRange[];
  }
}
