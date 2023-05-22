import { CronField } from './CronField.js';
import { CronChars, CronMax, CronMin, SixtyRange } from '../types.js';

const MIN_MINUTE = 0;
const MAX_MINUTE = 59;
const MINUTE_CHARS: readonly CronChars[] = Object.freeze([]);

/**
 * Represents the "second" field within a cron expression.
 * @class CronSecond
 * @extends CronField
 */
export class CronMinute extends CronField {
  static get min(): CronMin {
    return MIN_MINUTE;
  }

  static get max(): CronMax {
    return MAX_MINUTE;
  }

  static get chars(): readonly CronChars[] {
    return MINUTE_CHARS;
  }

  /**
   * CronSecond constructor. Initializes the "second" field with the provided values.
   * @param {SixtyRange[]} values - Values for the "second" field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   */
  constructor(values: SixtyRange[], wildcard = false) {
    super(values, wildcard);
    this.validate();
  }

  /**
   * Returns an array of allowed values for the "second" field.
   * @returns {SixtyRange[]}
   */
  get values(): SixtyRange[] {
    return super.values as SixtyRange[];
  }
}
