import { CronField, CronFieldOptions } from './CronField';
import { CronChars, CronMax, CronMin, SixtyRange } from './types';

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
   * @param {CronFieldOptions} [options] - Options provided by the parser
   */
  constructor(values: SixtyRange[], options?: CronFieldOptions) {
    super(values, options);
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
