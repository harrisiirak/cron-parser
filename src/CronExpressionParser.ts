import {CronConstants} from './CronConstants';
import {CronFields} from './CronFields';
import {CronDate} from './CronDate';
import {CronExpression} from './CronExpression';
import {DayOfTheMonthRange, DayOfTheWeekRange, HourRange, MonthRange, SixtyRange} from '../types';
import assert from 'assert';

import {DayOfWeekEnum, ICronExpressionParserOptions, ICronParserOptions, IFieldConstraint, MonthsEnum} from './types';

const STANDARD_VALID_CHARACTERS = /^[,*\d/-]+$/;
const DAY_OF_MONTH_VALID_CHARACTERS = /^[?,*\dL/-]+$/;
const DAY_OF_WEEK_VALID_CHARACTERS = /^[?,*\dL#/-]+$/;


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

  constructor() {
    throw new Error('This class is not meant to be instantiated.');
  }

  static get predefined(): Record<string, string> {
    return {
      '@yearly': '0 0 1 1 *',
      '@annually': '0 0 1 1 *',
      '@monthly': '0 0 1 * *',
      '@weekly': '0 0 * * 0',
      '@daily': '0 0 * * *',
      '@hourly': '0 * * * *',
    };
  }

  static parse(expression: string, options: ICronParserOptions = {}): CronExpression {
    options.expression = expression;
    if (typeof options.currentDate === 'undefined') {
      options.currentDate = new CronDate(undefined, 'UTC');
    }

    const predefinedKey = expression as keyof typeof CronExpressionParser.predefined;
    expression = CronExpressionParser.predefined[predefinedKey] ? CronExpressionParser.predefined[predefinedKey] : expression;

    const rawFields = CronExpressionParser.#getRawFields(expression);
    const second = CronExpressionParser.#parseField('second', rawFields.second, CronExpressionParser.constraints[0]) as SixtyRange[];
    const minute = CronExpressionParser.#parseField('minute', rawFields.minute, CronExpressionParser.constraints[1]) as SixtyRange[];
    const hour = CronExpressionParser.#parseField('hour', rawFields.hour, CronExpressionParser.constraints[2]) as HourRange[];
    const month = CronExpressionParser.#parseField('month', rawFields.month, CronExpressionParser.constraints[4]) as MonthRange[];
    const dayOfMonth = CronExpressionParser.#parseField('dayOfMonth', rawFields.dayOfMonth, CronExpressionParser.constraints[3]) as DayOfTheMonthRange[];
    rawFields.dayOfWeek = CronExpressionParser.#parseNthDay(rawFields.dayOfWeek, options);
    const dayOfWeek = CronExpressionParser.#parseField('dayOfWeek', rawFields.dayOfWeek, CronExpressionParser.constraints[5]) as DayOfTheWeekRange[];
    const fields = new CronFields({second, minute, hour, dayOfMonth, month, dayOfWeek});
    return new CronExpression(fields, options);
  }

  static #getRawFields(expression: string): { second: string, minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string } {
    expression = expression || '0 * * * * *';
    const atoms = expression.trim().split(/\s+/);
    assert(atoms.length <= 6, 'Invalid cron expression');
    const defaults = ['*', '*', '*', '*', '*', '0'];
    if (atoms.length < defaults.length) {
      atoms.unshift(...defaults.slice(atoms.length));
    }
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = atoms;
    return {second, minute, hour, dayOfMonth, month, dayOfWeek};
  }

  static #parseField(field: string, value: string, constraints: IFieldConstraint): (number | string)[] {
    // Replace aliases for month and dayOfWeek
    if (field === 'month' || field === 'dayOfWeek') {
      value = value.replace(/[a-z]{3}/gi, (match) => {
        match = match.toLowerCase();
        const replacer = MonthsEnum[match as keyof typeof MonthsEnum] || DayOfWeekEnum[match as keyof typeof DayOfWeekEnum];
        assert(replacer, `Validation error, cannot resolve alias "${match}"`);
        return replacer.toString();
      });
    }

    // Check for valid characters
    assert(CronExpressionParser.validCharacters[field].test(value), `Invalid characters, got value: ${value}`);

    // Replace '*' and '?'
    value = value.replace(/[*?]/g, constraints.min + '-' + constraints.max);
    return CronExpressionParser.#parseSequence(value, constraints, field);
  }

  static #parseSequence(val: string, constraints: IFieldConstraint, field: keyof typeof CronExpressionParser.validCharacters): (number | string)[] {
    const stack: (number | string)[] = [];

    function handleResult(result: number | string | (number | string)[], constraints: IFieldConstraint) {
      if (Array.isArray(result)) {
        result.forEach((value) => {
          if (CronExpressionParser.#isValidConstraintChar(constraints, value)) {
            stack.push(value);
          } else {
            const v = parseInt(value.toString(), 10);
            assert(v >= constraints.min && v <= constraints.max, `Constraint error, got value ${value} expected range ${constraints.min}-${constraints.max}`);
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
    stack.sort(CronFields.fieldSorter);
    return stack;
  }

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

  static #validateRange(min: number, max: number, constraints: IFieldConstraint): void {
    assert(!isNaN(min) && !isNaN(max) && min >= constraints.min && max <= constraints.max, `Constraint error, got range ${min}-${max} expected range ${constraints.min}-${constraints.max}`);
    assert(min <= max, `Invalid range: ${min}-${max}, min(${min}) > max(${max})`);
  }

  static #validateRepeatInterval(repeatInterval: number): void {
    assert(!isNaN(repeatInterval) && repeatInterval > 0, `Constraint error, cannot repeat at every ${repeatInterval} time.`);
  }

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

  static #parseNthDay(val: string, options: ICronExpressionParserOptions): string {
    const atoms = val.split('#');
    if (atoms.length <= 1) {
      return val;
    }
    const nthValue = +atoms[atoms.length - 1];
    const matches = val.match(/([,-/])/);
    assert(matches === null, `Constraint error, invalid dayOfWeek \`#\` and \`${matches?.[0]}\` special characters are incompatible`);
    assert(atoms.length <= 2 && !isNaN(nthValue) && (nthValue >= 1 && nthValue <= 5), 'Constraint error, invalid dayOfWeek occurrence number (#)');
    options.nthDayOfWeek = nthValue;
    return atoms[0];
  }

  static #isValidConstraintChar(constraints: IFieldConstraint, value: string | number): boolean {
    return constraints.chars.some((char) => value.toString().includes(char));
  }
}
