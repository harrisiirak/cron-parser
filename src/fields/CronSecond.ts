import { CronChars, CronMax, CronMin, SixtyRange } from '../types';
import { CronField } from './CronField';

const MIN_SECOND = 0;
const MAX_SECOND = 59;
const SECOND_CHARS: readonly CronChars[] = Object.freeze([]);

/**
 * Represents the "second" field within a cron expression.
 * @class CronSecond
 * @extends CronField
 */
export class CronSecond extends CronField {
  static get min(): CronMin {
    return MIN_SECOND;
  }
  static get max(): CronMax {
    return MAX_SECOND;
  }
  static get chars(): readonly CronChars[] {
    return SECOND_CHARS;
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
