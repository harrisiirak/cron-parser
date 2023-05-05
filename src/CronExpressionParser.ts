import {CronConstants} from './CronConstants';
import {CronDayOfMonth, CronDayOfTheWeek, CronFields, CronHour, CronMinute, CronMonth, CronSecond} from './CronFields';
import {CronDate} from './CronDate';
import {CronExpression} from './CronExpression';
import {DayOfTheMonthRange, DayOfTheWeekRange, DayOfWeekEnum, HourRange, ICronParseOptions, IFieldConstraint, MonthRange, MonthsEnum, PredefinedExpressionsEnum, RawCronFields, SixtyRange} from './types';
import assert from 'assert';

const STANDARD_VALID_CHARACTERS = /^[,*\d/-]+$/;
const DAY_OF_MONTH_VALID_CHARACTERS = /^[?,*\dL/-]+$/;
const DAY_OF_WEEK_VALID_CHARACTERS = /^[?,*\dL#/-]+$/;

/**
 * Static class that parses a cron expression and returns a CronExpression object.
 * @static
 * @class CronExpressionParser
 */
export class CronExpressionParser {
  // FIXME: these are a temporary solution to make the parser work with the current design of the library.
  private static constraints: IFieldConstraint[] = Object.values(CronConstants.constraints);
  private static validCharacters: { [key: string]: RegExp } = {
    second: STANDARD_VALID_CHARACTERS,
    minute: STANDARD_VALID_CHARACTERS,
    hour: STANDARD_VALID_CHARACTERS,
    dayOfMonth: DAY_OF_MONTH_VALID_CHARACTERS,
    month: STANDARD_VALID_CHARACTERS,
    dayOfWeek: DAY_OF_WEEK_VALID_CHARACTERS,
  };

  /**
   * Parses a cron expression and returns a CronExpression object.
   * @param {string} expression - The cron expression to parse.
   * @param {ICronParseOptions} [options={}] - The options to use when parsing the expression.
   * @param {boolean} [options.currentDate=false] - If true, will throw an error if the expression contains both dayOfMonth and dayOfWeek.
   * @param {boolean} [options.strict=false] - If true, will throw an error if the expression contains both dayOfMonth and dayOfWeek.
   * @param {CronDate} [options.currentDate=new CronDate(undefined, 'UTC')] - The date to use when calculating the next/previous occurrence.
   *
   * @returns {CronExpression} A CronExpression object.
   */
  static parse(expression: string, options: ICronParseOptions = {}): CronExpression {
    const {strict = false} = options;
    const currentDate = options.currentDate || new CronDate(undefined, 'UTC');

    expression = PredefinedExpressionsEnum[expression as keyof typeof PredefinedExpressionsEnum] || expression;
    const rawFields = CronExpressionParser.#getRawFields(expression, strict);
    assert(rawFields.dayOfMonth === '*' || rawFields.dayOfWeek === '*' || !strict, 'Cannot use both dayOfMonth and dayOfWeek together in strict mode!');

    const second = CronExpressionParser.#parseField('second', rawFields.second, CronExpressionParser.constraints[0]) as SixtyRange[];
    const minute = CronExpressionParser.#parseField('minute', rawFields.minute, CronExpressionParser.constraints[1]) as SixtyRange[];
    const hour = CronExpressionParser.#parseField('hour', rawFields.hour, CronExpressionParser.constraints[2]) as HourRange[];
    const month = CronExpressionParser.#parseField('month', rawFields.month, CronExpressionParser.constraints[4]) as MonthRange[];
    const dayOfMonth = CronExpressionParser.#parseField('dayOfMonth', rawFields.dayOfMonth, CronExpressionParser.constraints[3]) as DayOfTheMonthRange[];
    const {dayOfWeek: _dayOfWeek, nthDayOfWeek} = CronExpressionParser.#parseNthDay(rawFields.dayOfWeek);
    const dayOfWeek = CronExpressionParser.#parseField('dayOfWeek', _dayOfWeek, CronExpressionParser.constraints[5]) as DayOfTheWeekRange[];

    const fields = new CronFields({
      second: new CronSecond(second, ['*', '?'].includes(rawFields.second)),
      minute: new CronMinute(minute, ['*', '?'].includes(rawFields.minute)),
      hour: new CronHour(hour, ['*', '?'].includes(rawFields.hour)),
      dayOfMonth: new CronDayOfMonth(dayOfMonth, ['*', '?'].includes(rawFields.dayOfMonth)),
      month: new CronMonth(month, ['*', '?'].includes(rawFields.month)),
      dayOfWeek: new CronDayOfTheWeek(dayOfWeek, ['*', '?'].includes(rawFields.dayOfWeek)),
    });
    return new CronExpression(fields, {...options, expression, currentDate, nthDayOfWeek});
  }

  /**
   * Get the raw fields from a cron expression.
   * @param {string} expression - The cron expression to parse.
   * @param {boolean} [strict=false] - If true, will throw an error if the expression contains both dayOfMonth and dayOfWeek.
   * @private
   * @returns {RawCronFields} The raw fields.
   */
  static #getRawFields(expression: string, strict = false): RawCronFields {
    assert(!strict || expression > '', 'Invalid cron expression');
    expression = expression || '0 * * * * *';
    const atoms = expression.trim().split(/\s+/);
    assert(!strict || atoms.length === 6, 'Invalid cron expression, expected 6 fields');
    assert(atoms.length <= 6, 'Invalid cron expression, too many fields');
    const defaults = ['*', '*', '*', '*', '*', '0'];
    if (atoms.length < defaults.length) {
      atoms.unshift(...defaults.slice(atoms.length));
    }
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = atoms;
    return {second, minute, hour, dayOfMonth, month, dayOfWeek};
  }

  /**
   * Parse a field from a cron expression.
   * @param {string} field - The field to parse.
   * @param {string} value - The value of the field.
   * @param {IFieldConstraint} constraints - The constraints for the field.
   * @private
   * @returns {(number | string)[]} The parsed field.
   */
  static #parseField(field: string, value: string, constraints: IFieldConstraint): (number | string)[] {
    // Replace aliases for month and dayOfWeek
    if (field === 'month' || field === 'dayOfWeek') {
      value = value.replace(/[a-z]{3}/gi, (match) => {
        match = match.toLowerCase();
        const replacer = MonthsEnum[match as keyof typeof MonthsEnum] || DayOfWeekEnum[match as keyof typeof DayOfWeekEnum];
        assert(replacer != null, `Validation error, cannot resolve alias "${match}"`);
        return replacer.toString();
      });
    }

    // Check for valid characters
    assert(CronExpressionParser.validCharacters[field].test(value), `Invalid characters, got value: ${value}`);

    // Replace '*' and '?'
    value = value.replace(/[*?]/g, constraints.min + '-' + constraints.max);
    return CronExpressionParser.#parseSequence(value, constraints, field);
  }

  /**
   * Parse a sequence from a cron expression.
   * @param {string} val - The sequence to parse.
   * @param {IFieldConstraint} constraints - The constraints for the field.
   * @param {keyof typeof CronExpressionParser.validCharacters} field - The field to parse.
   * @private
   */
  static #parseSequence(val: string, constraints: IFieldConstraint, field: keyof typeof CronExpressionParser.validCharacters): (number | string)[] {
    const stack: (number | string)[] = [];

    function handleResult(result: number | string | (number | string)[], constraints: IFieldConstraint) {
      if (Array.isArray(result)) {
        result.forEach((value) => {
          /* istanbul ignore else - FIXME no idea how this is triggered or what it's purpose is */
          if (!CronExpressionParser.#isValidConstraintChar(constraints, value)) {
            const v = parseInt(value.toString(), 10);
            assert(v >= constraints.min && v <= constraints.max, `Constraint error, got value ${value} expected range ${constraints.min}-${constraints.max}`);
            stack.push(value);
          } else {
            /* istanbul ignore next - FIXME no idea how this is triggered or what it's purpose is */
            stack.push(value);
          }
        });
      } else {
        if (CronExpressionParser.#isValidConstraintChar(constraints, result)) {
          stack.push(result);
        } else {
          const v = parseInt(result.toString(), 10);
          assert(v >= constraints.min && v <= constraints.max, `Constraint error, got value ${result} expected range ${constraints.min}-${constraints.max}`);
          stack.push(field === 'dayOfWeek' ? v % 7 : result);
        }
      }
    }

    const atoms = val.split(',');
    assert(atoms.every((atom) => atom.length > 0), 'Invalid list value format');
    atoms.forEach((atom) => handleResult(CronExpressionParser.#parseRepeat(atom, constraints, field), constraints));
    return stack;
  }

  /**
   * Parse repeat from a cron expression.
   * @param {string} val - The repeat to parse.
   * @param {IFieldConstraint} constraints - The constraints for the field.
   * @param {keyof typeof CronExpressionParser.validCharacters} field - The field to parse.
   * @private
   * @returns {(number | string)[]} The parsed repeat.
   */
  static #parseRepeat(val: string, constraints: IFieldConstraint, field: keyof typeof CronExpressionParser.validCharacters): number[] | string[] | number | string {
    const atoms = val.split('/');
    assert(atoms.length <= 2, `Invalid repeat: ${val}`);
    if (atoms.length === 2) {
      if (!isNaN(parseInt(atoms[0]))) {
        atoms[0] = `${atoms[0]}-${constraints.max}`;
      }
      return CronExpressionParser.#parseRange(atoms[0], parseInt(atoms[1]), constraints, field);
    }

    return CronExpressionParser.#parseRange(val, 1, constraints, field);
  }

  /**
   * Validate a cron range.
   * @param {number} min - The minimum value of the range.
   * @param {number} max - The maximum value of the range.
   * @param {IFieldConstraint} constraints - The constraints for the field.
   * @private
   * @returns {void}
   * @throws {Error} Throws an error if the range is invalid.
   */
  static #validateRange(min: number, max: number, constraints: IFieldConstraint): void {
    assert(!isNaN(min) && !isNaN(max) && min >= constraints.min && max <= constraints.max, `Constraint error, got range ${min}-${max} expected range ${constraints.min}-${constraints.max}`);
    assert(min <= max, `Invalid range: ${min}-${max}, min(${min}) > max(${max})`);
  }

  /**
   * Validate a cron repeat interval.
   * @param {number} repeatInterval - The repeat interval to validate.
   * @private
   * @returns {void}
   * @throws {Error} Throws an error if the repeat interval is invalid.
   */
  static #validateRepeatInterval(repeatInterval: number): void {
    assert(!isNaN(repeatInterval) && repeatInterval > 0, `Constraint error, cannot repeat at every ${repeatInterval} time.`);
  }

  /**
   * Create a range from a cron expression.
   * @param {number} min - The minimum value of the range.
   * @param {number} max - The maximum value of the range.
   * @param {number} repeatInterval - The repeat interval of the range.
   * @param {keyof typeof CronExpressionParser.validCharacters} field - The field to parse.
   * @private
   * @returns {number[]} The created range.
   */
  static #createRange(min: number, max: number, repeatInterval: number, field: keyof typeof CronExpressionParser.validCharacters): number[] {
    const stack: number[] = [];
    if (field === 'dayOfWeek' && max % 7 === 0) {
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
   * @param {string} val - The range to parse.
   * @param {number} repeatInterval - The repeat interval of the range.
   * @param {IFieldConstraint} constraints - The constraints for the field.
   * @param {keyof typeof CronExpressionParser.validCharacters} field - The field to parse.
   * @private
   * @returns {number[] | string[] | number | string} The parsed range.
   */
  static #parseRange(val: string, repeatInterval: number, constraints: IFieldConstraint, field: keyof typeof CronExpressionParser.validCharacters): number[] | string[] | number | string {
    const atoms: string[] = val.split('-');
    if (atoms.length <= 1) {
      return isNaN(+val) ? val : +val;
    }
    const [min, max] = atoms.map(num => parseInt(num));
    this.#validateRange(min, max, constraints);
    this.#validateRepeatInterval(repeatInterval);

    // Create range
    return this.#createRange(min, max, repeatInterval, field);
  }

  /**
   * Parse a cron expression.
   * @param {string} val - The cron expression to parse.
   * @private
   * @returns {string} The parsed cron expression.
   */
  static #parseNthDay(val: string): {dayOfWeek: string, nthDayOfWeek?: number} {
    const atoms = val.split('#');
    if (atoms.length <= 1) {
      return {dayOfWeek: atoms[0]};
    }
    const nthValue = +atoms[atoms.length - 1];
    const matches = val.match(/([,-/])/);
    assert(matches === null, `Constraint error, invalid dayOfWeek \`#\` and \`${matches?.[0]}\` special characters are incompatible`);
    assert(atoms.length <= 2 && !isNaN(nthValue) && (nthValue >= 1 && nthValue <= 5), 'Constraint error, invalid dayOfWeek occurrence number (#)');
    return {dayOfWeek: atoms[0], nthDayOfWeek: nthValue};
  }

  /**
   * Checks if a character is valid for a field.
   * @param {IFieldConstraint} constraints - The constraints for the field.
   * @param {string | number} value - The value to check.
   * @private
   * @returns {boolean} Whether the character is valid for the field.
   */
  static #isValidConstraintChar(constraints: IFieldConstraint, value: string | number): boolean {
    return constraints.chars.some((char) => value.toString().includes(char));
  }
}
