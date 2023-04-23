import {CronConstants} from './CronConstants';
import {CronFields} from './CronFields';
import {CronDate} from './date';
import {CronExpression} from './expression';
import {DayOfTheMonthRange, DayOfTheWeekRange, HourRange, MonthRange, SixtyRange} from '../types';
import assert from 'assert';

import {FieldConstraints, CronAliasesType, CronExpressionParserOptions} from './types';

export class CronExpressionParser {

    // FIXME: these are a temporary solution to make the parser work with the current design of the library.
    private static constraints: FieldConstraints[] = Object.values(CronConstants.constraints);
    static #cronAliases: CronAliasesType = {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12, sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6};
    private static standardValidCharacters = /^[,*\d/-]+$/;
    private static dayOfWeekValidCharacters = /^[?,*\dL#/-]+$/;
    private static dayOfMonthValidCharacters = /^[?,*\dL/-]+$/;
    private static validCharacters: {[key: string]: RegExp} = {
        second: CronExpressionParser.standardValidCharacters,
        minute: CronExpressionParser.standardValidCharacters,
        hour: CronExpressionParser.standardValidCharacters,
        dayOfMonth: CronExpressionParser.dayOfMonthValidCharacters,
        month: CronExpressionParser.standardValidCharacters,
        dayOfWeek: CronExpressionParser.dayOfWeekValidCharacters,
    };

    constructor() {
        throw new Error('This class is not meant to be instantiated.');
    }

    static parse(expression: string, options: CronExpressionParserOptions = {}): CronExpression {
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

    static #getAtoms(expression: string): string[] {
        const atoms = expression.trim().split(/\s+/);
        assert(atoms.length <= 6, 'Invalid cron expression');
        return atoms;
    }

    static #getRawFields(expression: string): { second: string, minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string } {
        expression = expression || '0 * * * * *';
        const atoms = CronExpressionParser.#getAtoms(expression);
        // FIXME: this should be the correct value but is not how the original library works
        // const defaults = ['0', '*', '*', '*', '*', '*'];
        const defaults = ['*', '*', '*', '*', '*', '0']; // FIXME <-- not sure about that last 0? should be 0 or *?
        if (atoms.length < defaults.length) {
            atoms.unshift(...defaults.slice(atoms.length));
        }
        const [second, minute, hour, dayOfMonth, month, dayOfWeek] = atoms;
        return {second, minute, hour, dayOfMonth, month, dayOfWeek};
    }

    static #parseField(field: string, value: string, constraints: FieldConstraints): (number | string)[] {
        // Replace aliases for month and dayOfWeek
        if (field === 'month' || field === 'dayOfWeek') {
            value = value.replace(/[a-z]{3}/gi, (match) => {
                match = match.toLowerCase();
                assert(CronExpressionParser.#cronAliases[match] !== undefined, `Validation error, cannot resolve alias "${match}"`);
                return CronExpressionParser.#cronAliases[match].toString();
            });
        }

        // Check for valid characters
        assert(CronExpressionParser.validCharacters[field].test(value), `Invalid characters, got value: ${value}`);

        // Replace '*' and '?'
        value = value.replace(/[*?]/g, constraints.min + '-' + constraints.max);
        return CronExpressionParser.#parseSequence(value, constraints, field);
    }

    static #parseSequence(val: string, constraints: FieldConstraints, field: keyof typeof CronExpressionParser.validCharacters): (number | string)[] {
        const stack: (number | string)[] = [];

        function handleResult(result: number | string | (number | string)[], constraints: FieldConstraints) {
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

    static #parseRepeat(val: string, constraints: FieldConstraints, field: keyof typeof CronExpressionParser.validCharacters): number[] | string[] | number | string {
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

    static #parseRange(val: string, repeatInterval: number, constraints: FieldConstraints, field: keyof typeof CronExpressionParser.validCharacters): number[] | string[] | number | string {
        const stack: number[] = [];
        const atoms: string[] = val.split('-');

        if (atoms.length > 1) {
            if (!atoms[0].length) {
                assert(atoms[1].length > 0, `Invalid range: ${val}`);
                return +val;
            }

            // Validate range
            const min = +atoms[0];
            const max = +atoms[1];

            assert(!isNaN(min) && !isNaN(max) && min >= constraints.min && max <= constraints.max, `Constraint error, got range ${min}-${max} expected range ${constraints.min}-${constraints.max}`);
            assert(min <= max, `Invalid range: ${val} min(${min}) > max(${max})`);

            // Create range
            let repeatIndex: number = +repeatInterval;
            assert(!isNaN(repeatIndex) && repeatIndex > 0, `Constraint error, cannot repeat at every ${repeatIndex} time.`);

            // JS DOW is in range of 0-6 (SUN-SAT) but we also support 7 in the expression. Handle case when range contains 7 instead of 0 and translate this value to 0
            if (field === 'dayOfWeek' && max % 7 === 0) {
                stack.push(0);
            }

            for (let index = min, count = max; index <= count; index++) {
                const exists = stack.indexOf(index) !== -1;
                if (!exists && repeatIndex > 0 && (repeatIndex % repeatInterval) === 0) {
                    repeatIndex = 1;
                    stack.push(index);
                } else {
                    repeatIndex++;
                }
            }
            return stack;
        }

        return isNaN(+val) ? val : +val;
    }

    static #parseNthDay(val: string, options: CronExpressionParserOptions): string {
        const atoms = val.split('#');
        if (atoms.length > 1) {
            const nthValue = +atoms[atoms.length - 1];
            if (/,/.test(val)) {
                throw new Error('Constraint error, invalid dayOfWeek `#` and `,` special characters are incompatible');
            }
            if (/\//.test(val)) {
                throw new Error('Constraint error, invalid dayOfWeek `#` and `/` special characters are incompatible');
            }
            if (/-/.test(val)) {
                throw new Error('Constraint error, invalid dayOfWeek `#` and `-` special characters are incompatible');
            }
            if (atoms.length > 2 || Number.isNaN(nthValue) || (nthValue < 1 || nthValue > 5)) {
                throw new Error('Constraint error, invalid dayOfWeek occurrence number (#)');
            }

            options.nthDayOfWeek = nthValue;
            return atoms[0];
        }
        return val;
    }

    static #isValidConstraintChar(constraints: FieldConstraints, value: string | number): boolean {
        return constraints.chars.some((char) => value.toString().includes(char));
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
}