import { CronField } from './CronField.js';
import { CronChars, CronMax, CronMin, HourRange } from '../types.js';

const MIN_HOUR = 0;
const MAX_HOUR = 23;
const HOUR_CHARS = [] as CronChars[];

/**
 * Represents the "hour" field within a cron expression.
 * @class CronHour
 * @extends CronField
 */
export class CronHour extends CronField {
  static get min(): CronMin {
    return MIN_HOUR;
  }

  static get max(): CronMax {
    return MAX_HOUR;
  }

  static get chars(): CronChars[] {
    return HOUR_CHARS;
  }

  /**
   * CronHour constructor. Initializes the "hour" field with the provided values.
   * @param {HourRange[]} values - Values for the "hour" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: HourRange[], wildcard = false) {
    super(values, wildcard);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "hour" field.
   * @returns {HourRange[]}
   */
  get values(): HourRange[] {
    return super.values as HourRange[];
  }
}
