import { CronField } from './CronField';
import { CronChars, HourRange } from '../types';

const MIN_HOUR = 0;
const MAX_HOUR = 23;
const HOUR_CHARS = [] as CronChars[];

/**
 * Represents the "hour" field within a cron expression.
 * @class CronHour
 * @extends CronField
 */
export class CronHour extends CronField {
  /**
   * CronHour constructor. Initializes the "hour" field with the provided values.
   * @param {HourRange[]} values - Values for the "hour" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: HourRange[], wildcard = false) {
    super(values, MIN_HOUR, MAX_HOUR, HOUR_CHARS, wildcard);
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
