import { CronFieldCollection } from './CronFieldCollection';
import { CronDate } from './CronDate';
import { CronExpression, CronExpressionOptions } from './CronExpression';
import { type PRNG, seededRandom } from './utils/random';
import {
  CronSecond,
  CronMinute,
  CronHour,
  CronMonth,
  CronDayOfMonth,
  CronDayOfWeek,
  CronConstraints,
  DayOfMonthRange,
  DayOfWeekRange,
  HourRange,
  MonthRange,
  ParseRangeResponse,
  SixtyRange,
} from './fields';

export enum PredefinedExpressions {
  '@yearly' = '0 0 0 1 1 *',
  '@annually' = '0 0 0 1 1 *',
  '@monthly' = '0 0 0 1 * *',
  '@weekly' = '0 0 0 * * 0',
  '@daily' = '0 0 0 * * *',
  '@hourly' = '0 0 * * * *',
  '@minutely' = '0 * * * * *',
  '@secondly' = '* * * * * *',
  '@weekdays' = '0 0 0 * * 1-5',
  '@weekends' = '0 0 0 * * 0,6',
}

export enum CronUnit {
  Second = 'Second',
  Minute = 'Minute',
  Hour = 'Hour',
  DayOfMonth = 'DayOfMonth',
  Month = 'Month',
  DayOfWeek = 'DayOfWeek',
}

// these need to be lowercase for the parser to work
export enum Months {
  jan = 1,
  feb = 2,
  mar = 3,
  apr = 4,
  may = 5,
  jun = 6,
  jul = 7,
  aug = 8,
  sep = 9,
  oct = 10,
  nov = 11,
  dec = 12,
}

// these need to be lowercase for the parser to work
export enum DayOfWeek {
  sun = 0,
  mon = 1,
  tue = 2,
  wed = 3,
  thu = 4,
  fri = 5,
  sat = 6,
}

export type RawCronFields = {
  second: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

/**
 * Static class that parses a cron expression and returns a CronExpression object.
 * @static
 * @class CronExpressionParser
 */
export class CronExpressionParser {
  /**
   * Parses a cron expression and returns a CronExpression object.
   * @param {string} expression - The cron expression to parse.
   * @param {CronExpressionOptions} [options={}] - The options to use when parsing the expression.
   * @param {boolean} [options.strict=false] - If true, will throw an error if the expression contains both dayOfMonth and dayOfWeek.
   * @param {CronDate} [options.currentDate=new CronDate(undefined, 'UTC')] - The date to use when calculating the next/previous occurrence.
   *
   * @returns {CronExpression} A CronExpression object.
   */
  static parse(expression: string, options: CronExpressionOptions = {}): CronExpression {
    const { strict = false } = options;
    const currentDate = options.currentDate || new CronDate();

    const rand = seededRandom(options.seed);

    expression = PredefinedExpressions[expression as keyof typeof PredefinedExpressions] || expression;
    const rawFields = CronExpressionParser.#getRawFields(expression, strict);
    if (!(rawFields.dayOfMonth === '*' || rawFields.dayOfWeek === '*' || !strict)) {
      throw new Error('Cannot use both dayOfMonth and dayOfWeek together in strict mode!');
    }

    const second = CronExpressionParser.#parseField(
      CronUnit.Second,
      rawFields.second,
      CronSecond.constraints,
      rand,
    ) as SixtyRange[];
    const minute = CronExpressionParser.#parseField(
      CronUnit.Minute,
      rawFields.minute,
      CronMinute.constraints,
      rand,
    ) as SixtyRange[];
    const hour = CronExpressionParser.#parseField(
      CronUnit.Hour,
      rawFields.hour,
      CronHour.constraints,
      rand,
    ) as HourRange[];
    const month = CronExpressionParser.#parseField(
      CronUnit.Month,
      rawFields.month,
      CronMonth.constraints,
      rand,
    ) as MonthRange[];
    const dayOfMonth = CronExpressionParser.#parseField(
      CronUnit.DayOfMonth,
      rawFields.dayOfMonth,
      CronDayOfMonth.constraints,
      rand,
    ) as DayOfMonthRange[];
    const { dayOfWeek: _dayOfWeek, nthDayOfWeek } = CronExpressionParser.#parseNthDay(rawFields.dayOfWeek);
    const dayOfWeek = CronExpressionParser.#parseField(
      CronUnit.DayOfWeek,
      _dayOfWeek,
      CronDayOfWeek.constraints,
      rand,
    ) as DayOfWeekRange[];

    const fields = new CronFieldCollection({
      second: new CronSecond(second, ['*', '?'].includes(rawFields.second)),
      minute: new CronMinute(minute, ['*', '?'].includes(rawFields.minute)),
      hour: new CronHour(hour, ['*', '?'].includes(rawFields.hour)),
      dayOfMonth: new CronDayOfMonth(dayOfMonth, ['*', '?'].includes(rawFields.dayOfMonth)),
      month: new CronMonth(month, ['*', '?'].includes(rawFields.month)),
      dayOfWeek: new CronDayOfWeek(dayOfWeek, ['*', '?'].includes(rawFields.dayOfWeek)),
    });
    return new CronExpression(fields, { ...options, expression, currentDate, nthDayOfWeek });
  }

  /**
   * Get the raw fields from a cron expression.
   * @param {string} expression - The cron expression to parse.
   * @param {boolean} strict - If true, will throw an error if the expression contains both dayOfMonth and dayOfWeek.
   * @private
   * @returns {RawCronFields} The raw fields.
   */
  static #getRawFields(expression: string, strict: boolean): RawCronFields {
    if (strict && !expression.length) {
      throw new Error('Invalid cron expression');
    }
    expression = expression || '0 * * * * *';
    const atoms = expression.trim().split(/\s+/);
    if (strict && atoms.length < 6) {
      throw new Error('Invalid cron expression, expected 6 fields');
    }
    if (atoms.length > 6) {
      throw new Error('Invalid cron expression, too many fields');
    }
    const defaults = ['*', '*', '*', '*', '*', '0'];
    if (atoms.length < defaults.length) {
      atoms.unshift(...defaults.slice(atoms.length));
    }
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = atoms;
    return { second, minute, hour, dayOfMonth, month, dayOfWeek };
  }

  /**
   * Parse a field from a cron expression.
   * @param {CronUnit} field - The field to parse.
   * @param {string} value - The value of the field.
   * @param {CronConstraints} constraints - The constraints for the field.
   * @private
   * @returns {(number | string)[]} The parsed field.
   */
  static #parseField(field: CronUnit, value: string, constraints: CronConstraints, rand: PRNG): (number | string)[] {
    // Replace aliases for month and dayOfWeek
    if (field === CronUnit.Month || field === CronUnit.DayOfWeek) {
      value = value.replace(/[a-z]{3}/gi, (match) => {
        match = match.toLowerCase();
        const replacer = Months[match as keyof typeof Months] || DayOfWeek[match as keyof typeof DayOfWeek];
        if (replacer === undefined) {
          throw new Error(`Validation error, cannot resolve alias "${match}"`);
        }
        return replacer.toString();
      });
    }

    // Check for valid characters
    if (!constraints.validChars.test(value)) {
      throw new Error(`Invalid characters, got value: ${value}`);
    }

    // Replace '*' and '?'
    value = value.replace(/[*?]/g, constraints.min + '-' + constraints.max);
    // Replace 'H' using the seeded PRNG
    value = value.replace(/H/g, String(Math.floor(rand() * (constraints.max - constraints.min + 1) + constraints.min)));
    return CronExpressionParser.#parseSequence(field, value, constraints);
  }

  /**
   * Parse a sequence from a cron expression.
   * @param {CronUnit} field - The field to parse.
   * @param {string} val - The sequence to parse.
   * @param {CronConstraints} constraints - The constraints for the field.
   * @private
   */
  static #parseSequence(field: CronUnit, val: string, constraints: CronConstraints): (number | string)[] {
    const stack: (number | string)[] = [];
    function handleResult(result: number | string | (number | string)[], constraints: CronConstraints) {
      if (Array.isArray(result)) {
        stack.push(...result);
      } else {
        if (CronExpressionParser.#isValidConstraintChar(constraints, result)) {
          stack.push(result);
        } else {
          const v = parseInt(result.toString(), 10);
          const isValid = v >= constraints.min && v <= constraints.max;
          if (!isValid) {
            throw new Error(
              `Constraint error, got value ${result} expected range ${constraints.min}-${constraints.max}`,
            );
          }
          stack.push(field === CronUnit.DayOfWeek ? v % 7 : result);
        }
      }
    }

    const atoms = val.split(',');
    atoms.forEach((atom) => {
      if (!(atom.length > 0)) {
        throw new Error('Invalid list value format');
      }
      handleResult(CronExpressionParser.#parseRepeat(field, atom, constraints), constraints);
    });
    return stack;
  }

  /**
   * Parse repeat from a cron expression.
   * @param {CronUnit} field - The field to parse.
   * @param {string} val - The repeat to parse.
   * @param {CronConstraints} constraints - The constraints for the field.
   * @private
   * @returns {(number | string)[]} The parsed repeat.
   */
  static #parseRepeat(field: CronUnit, val: string, constraints: CronConstraints): ParseRangeResponse {
    const atoms = val.split('/');
    if (atoms.length > 2) {
      throw new Error(`Invalid repeat: ${val}`);
    }
    if (atoms.length === 2) {
      if (!isNaN(parseInt(atoms[0], 10))) {
        atoms[0] = `${atoms[0]}-${constraints.max}`;
      }
      return CronExpressionParser.#parseRange(field, atoms[0], parseInt(atoms[1], 10), constraints);
    }

    return CronExpressionParser.#parseRange(field, val, 1, constraints);
  }

  /**
   * Validate a cron range.
   * @param {number} min - The minimum value of the range.
   * @param {number} max - The maximum value of the range.
   * @param {CronConstraints} constraints - The constraints for the field.
   * @private
   * @returns {void}
   * @throws {Error} Throws an error if the range is invalid.
   */
  static #validateRange(min: number, max: number, constraints: CronConstraints): void {
    const isValid = !isNaN(min) && !isNaN(max) && min >= constraints.min && max <= constraints.max;
    if (!isValid) {
      throw new Error(`Constraint error, got range ${min}-${max} expected range ${constraints.min}-${constraints.max}`);
    }
    if (min > max) {
      throw new Error(`Invalid range: ${min}-${max}, min(${min}) > max(${max})`);
    }
  }

  /**
   * Validate a cron repeat interval.
   * @param {number} repeatInterval - The repeat interval to validate.
   * @private
   * @returns {void}
   * @throws {Error} Throws an error if the repeat interval is invalid.
   */
  static #validateRepeatInterval(repeatInterval: number): void {
    if (!(!isNaN(repeatInterval) && repeatInterval > 0)) {
      throw new Error(`Constraint error, cannot repeat at every ${repeatInterval} time.`);
    }
  }

  /**
   * Create a range from a cron expression.
   * @param {CronUnit} field - The field to parse.
   * @param {number} min - The minimum value of the range.
   * @param {number} max - The maximum value of the range.
   * @param {number} repeatInterval - The repeat interval of the range.
   * @private
   * @returns {number[]} The created range.
   */
  static #createRange(field: CronUnit, min: number, max: number, repeatInterval: number): number[] {
    const stack: number[] = [];
    if (field === CronUnit.DayOfWeek && max % 7 === 0) {
      stack.push(0);
    }
    for (let index = min; index <= max; index += repeatInterval) {
      if (stack.indexOf(index) === -1) {
        stack.push(index);
      }
    }
    return stack;
  }

  /**
   * Parse a range from a cron expression.
   * @param {CronUnit} field - The field to parse.
   * @param {string} val - The range to parse.
   * @param {number} repeatInterval - The repeat interval of the range.
   * @param {CronConstraints} constraints - The constraints for the field.
   * @private
   * @returns {number[] | string[] | number | string} The parsed range.
   */
  static #parseRange(
    field: CronUnit,
    val: string,
    repeatInterval: number,
    constraints: CronConstraints,
  ): ParseRangeResponse {
    const atoms: string[] = val.split('-');
    if (atoms.length <= 1) {
      return isNaN(+val) ? val : +val;
    }
    const [min, max] = atoms.map((num) => parseInt(num, 10));
    this.#validateRange(min, max, constraints);
    this.#validateRepeatInterval(repeatInterval);

    // Create range
    return this.#createRange(field, min, max, repeatInterval);
  }

  /**
   * Parse a cron expression.
   * @param {string} val - The cron expression to parse.
   * @private
   * @returns {string} The parsed cron expression.
   */
  static #parseNthDay(val: string): { dayOfWeek: string; nthDayOfWeek?: number } {
    const atoms = val.split('#');
    if (atoms.length <= 1) {
      return { dayOfWeek: atoms[0] };
    }
    const nthValue = +atoms[atoms.length - 1];
    const matches = val.match(/([,-/])/);
    if (matches !== null) {
      throw new Error(
        `Constraint error, invalid dayOfWeek \`#\` and \`${matches?.[0]}\` special characters are incompatible`,
      );
    }
    if (!(atoms.length <= 2 && !isNaN(nthValue) && nthValue >= 1 && nthValue <= 5)) {
      throw new Error('Constraint error, invalid dayOfWeek occurrence number (#)');
    }
    return { dayOfWeek: atoms[0], nthDayOfWeek: nthValue };
  }

  /**
   * Checks if a character is valid for a field.
   * @param {CronConstraints} constraints - The constraints for the field.
   * @param {string | number} value - The value to check.
   * @private
   * @returns {boolean} Whether the character is valid for the field.
   */
  static #isValidConstraintChar(constraints: CronConstraints, value: string | number): boolean {
    return constraints.chars.some((char) => value.toString().includes(char));
  }
}
