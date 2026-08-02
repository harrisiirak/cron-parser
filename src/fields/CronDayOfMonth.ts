import { CronField, CronFieldOptions } from './CronField';
import { CronMonth } from './CronMonth';
import { CronChars, CronMax, CronMin, DayOfMonthRange, MonthRange } from './types';

const MIN_DAY = 1;
const MAX_DAY = 31;
const DAY_CHARS = Object.freeze(['L']) as CronChars[];

/**
 * Represents the "day of the month" field within a cron expression.
 * @class CronDayOfMonth
 * @extends CronField
 */
export class CronDayOfMonth extends CronField {
  /**
   * Creates a "day of the month" field limited to the days the given month has.
   * @param {MonthRange[]} month - Values for the "month" field the days are used with
   * @param {DayOfMonthRange[]} values - Values for the "day of the month" field
   * @param {CronFieldOptions} [options] - Options provided by the parser
   * @returns {CronDayOfMonth}
   */
  static fromMonth(month: MonthRange[], values: DayOfMonthRange[], options?: CronFieldOptions): CronDayOfMonth {
    if (month.length !== 1) {
      return new CronDayOfMonth(values, options);
    }

    const daysInMonth = CronMonth.daysInMonth[month[0] - 1];
    const days = values.filter((value) => typeof value !== 'number' || value <= daysInMonth);
    return new CronDayOfMonth(days.length > 0 ? days : values, options);
  }

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
    return /^[?,*\dLH/-]+$|^.*H\(\d+-\d+\)\/\d+.*$|^.*H\(\d+-\d+\).*$|^.*H\/\d+.*$/;
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
