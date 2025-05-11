import { CronField, CronFieldOptions } from './CronField';
import { CronChars, CronMax, CronMin, HourRange } from './types';

const MIN_HOUR = 0;
const MAX_HOUR = 23;
const HOUR_CHARS: readonly CronChars[] = Object.freeze([]);

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

  static get chars(): readonly CronChars[] {
    return HOUR_CHARS;
  }

  /**
   * CronHour constructor. Initializes the "hour" field with the provided values.
   * @param {HourRange[]} values - Values for the "hour" field
   * @param {CronFieldOptions} [options] - Options provided by the parser
   */
  constructor(values: HourRange[], options?: CronFieldOptions) {
    super(values, options);
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
