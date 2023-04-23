"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronExpressionParser = void 0;
const CronConstants_1 = require("./CronConstants");
const CronFields_1 = require("./CronFields");
const date_1 = require("./date");
const expression_1 = require("./expression");
const assert_1 = __importDefault(require("assert"));
var MonthsEnum;
(function (MonthsEnum) {
    MonthsEnum[MonthsEnum["jan"] = 1] = "jan";
    MonthsEnum[MonthsEnum["feb"] = 2] = "feb";
    MonthsEnum[MonthsEnum["mar"] = 3] = "mar";
    MonthsEnum[MonthsEnum["apr"] = 4] = "apr";
    MonthsEnum[MonthsEnum["may"] = 5] = "may";
    MonthsEnum[MonthsEnum["jun"] = 6] = "jun";
    MonthsEnum[MonthsEnum["jul"] = 7] = "jul";
    MonthsEnum[MonthsEnum["aug"] = 8] = "aug";
    MonthsEnum[MonthsEnum["sep"] = 9] = "sep";
    MonthsEnum[MonthsEnum["oct"] = 10] = "oct";
    MonthsEnum[MonthsEnum["nov"] = 11] = "nov";
    MonthsEnum[MonthsEnum["dec"] = 12] = "dec";
})(MonthsEnum || (MonthsEnum = {}));
var DayOfWeekEnum;
(function (DayOfWeekEnum) {
    DayOfWeekEnum[DayOfWeekEnum["sun"] = 0] = "sun";
    DayOfWeekEnum[DayOfWeekEnum["mon"] = 1] = "mon";
    DayOfWeekEnum[DayOfWeekEnum["tue"] = 2] = "tue";
    DayOfWeekEnum[DayOfWeekEnum["wed"] = 3] = "wed";
    DayOfWeekEnum[DayOfWeekEnum["thu"] = 4] = "thu";
    DayOfWeekEnum[DayOfWeekEnum["fri"] = 5] = "fri";
    DayOfWeekEnum[DayOfWeekEnum["sat"] = 6] = "sat";
})(DayOfWeekEnum || (DayOfWeekEnum = {}));
class CronExpressionParser {
    // FIXME: these are a temporary solution to make the parser work with the current design of the library.
    static constraints = Object.values(CronConstants_1.CronConstants.constraints);
    static #cronAliases = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12, sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    static standardValidCharacters = /^[,*\d/-]+$/;
    static dayOfWeekValidCharacters = /^[?,*\dL#/-]+$/;
    static dayOfMonthValidCharacters = /^[?,*\dL/-]+$/;
    static validCharacters = {
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
    static parse(expression, options = {}) {
        if (typeof options.currentDate === 'undefined') {
            options.currentDate = new date_1.CronDate(undefined, 'UTC');
        }
        const predefinedKey = expression;
        expression = CronExpressionParser.predefined[predefinedKey] ? CronExpressionParser.predefined[predefinedKey] : expression;
        const rawFields = CronExpressionParser.#getRawFields(expression);
        const second = CronExpressionParser.#parseField('second', rawFields.second, CronExpressionParser.constraints[0]);
        const minute = CronExpressionParser.#parseField('minute', rawFields.minute, CronExpressionParser.constraints[1]);
        const hour = CronExpressionParser.#parseField('hour', rawFields.hour, CronExpressionParser.constraints[2]);
        const month = CronExpressionParser.#parseField('month', rawFields.month, CronExpressionParser.constraints[4]);
        const dayOfMonth = CronExpressionParser.#parseField('dayOfMonth', rawFields.dayOfMonth, CronExpressionParser.constraints[3]);
        rawFields.dayOfWeek = CronExpressionParser.#parseNthDay(rawFields.dayOfWeek, options);
        const dayOfWeek = CronExpressionParser.#parseField('dayOfWeek', rawFields.dayOfWeek, CronExpressionParser.constraints[5]);
        const fields = new CronFields_1.CronFields({ second, minute, hour, dayOfMonth, month, dayOfWeek });
        return new expression_1.CronExpression(fields, options);
    }
    static #getAtoms(expression) {
        const atoms = expression.trim().split(/\s+/);
        (0, assert_1.default)(atoms.length <= 6, 'Invalid cron expression');
        return atoms;
    }
    static #getRawFields(expression) {
        expression = expression || '0 * * * * *';
        const atoms = CronExpressionParser.#getAtoms(expression);
        // FIXME: this should be the correct value but is not how the original library works
        // const defaults = ['0', '*', '*', '*', '*', '*'];
        const defaults = ['*', '*', '*', '*', '*', '0']; // FIXME <-- not sure about that last 0? should be 0 or *?
        if (atoms.length < defaults.length) {
            atoms.unshift(...defaults.slice(atoms.length));
        }
        const [second, minute, hour, dayOfMonth, month, dayOfWeek] = atoms;
        return { second, minute, hour, dayOfMonth, month, dayOfWeek };
    }
    static #parseField(field, value, constraints) {
        // Replace aliases for month and dayOfWeek
        if (field === 'month' || field === 'dayOfWeek') {
            value = value.replace(/[a-z]{3}/gi, (match) => {
                match = match.toLowerCase();
                (0, assert_1.default)(CronExpressionParser.#cronAliases[match] !== undefined, `Validation error, cannot resolve alias "${match}"`);
                return CronExpressionParser.#cronAliases[match].toString();
            });
        }
        // Check for valid characters
        (0, assert_1.default)(CronExpressionParser.validCharacters[field].test(value), `Invalid characters, got value: ${value}`);
        // Replace '*' and '?'
        value = value.replace(/[*?]/g, constraints.min + '-' + constraints.max);
        return CronExpressionParser.#parseSequence(value, constraints, field);
    }
    static #parseSequence(val, constraints, field) {
        const stack = [];
        function handleResult(result, constraints) {
            if (Array.isArray(result)) {
                result.forEach((value) => {
                    if (CronExpressionParser.#isValidConstraintChar(constraints, value)) {
                        stack.push(value);
                    }
                    else {
                        const v = parseInt(value.toString(), 10);
                        (0, assert_1.default)(v >= constraints.min && v <= constraints.max, `Constraint error, got value ${value} expected range ${constraints.min}-${constraints.max}`);
                        stack.push(value);
                    }
                });
            }
            else {
                if (CronExpressionParser.#isValidConstraintChar(constraints, result)) {
                    stack.push(result);
                }
                else {
                    const v = parseInt(result.toString(), 10);
                    (0, assert_1.default)(v >= constraints.min && v <= constraints.max, `Constraint error, got value ${result} expected range ${constraints.min}-${constraints.max}`);
                    stack.push(field === 'dayOfWeek' ? v % 7 : result);
                }
            }
        }
        const atoms = val.split(',');
        (0, assert_1.default)(atoms.every((atom) => atom.length > 0), 'Invalid list value format');
        atoms.forEach((atom) => handleResult(CronExpressionParser.#parseRepeat(atom, constraints, field), constraints));
        stack.sort(CronFields_1.CronFields.fieldSorter);
        return stack;
    }
    static #parseRepeat(val, constraints, field) {
        const atoms = val.split('/');
        (0, assert_1.default)(atoms.length <= 2, `Invalid repeat: ${val}`);
        if (atoms.length === 2) {
            if (!isNaN(parseInt(atoms[0]))) {
                atoms[0] = `${atoms[0]}-${constraints.max}`;
            }
            return CronExpressionParser.#parseRange(atoms[0], parseInt(atoms[1]), constraints, field);
        }
        return CronExpressionParser.#parseRange(val, 1, constraints, field);
    }
    static #parseRange(val, repeatInterval, constraints, field) {
        const stack = [];
        const atoms = val.split('-');
        if (atoms.length > 1) {
            if (!atoms[0].length) {
                (0, assert_1.default)(atoms[1].length > 0, `Invalid range: ${val}`);
                return +val;
            }
            // Validate range
            const min = +atoms[0];
            const max = +atoms[1];
            (0, assert_1.default)(!isNaN(min) && !isNaN(max) && min >= constraints.min && max <= constraints.max, `Constraint error, got range ${min}-${max} expected range ${constraints.min}-${constraints.max}`);
            (0, assert_1.default)(min <= max, `Invalid range: ${val} min(${min}) > max(${max})`);
            // Create range
            let repeatIndex = +repeatInterval;
            (0, assert_1.default)(!isNaN(repeatIndex) && repeatIndex > 0, `Constraint error, cannot repeat at every ${repeatIndex} time.`);
            // JS DOW is in range of 0-6 (SUN-SAT) but we also support 7 in the expression. Handle case when range contains 7 instead of 0 and translate this value to 0
            if (field === 'dayOfWeek' && max % 7 === 0) {
                stack.push(0);
            }
            for (let index = min, count = max; index <= count; index++) {
                const exists = stack.indexOf(index) !== -1;
                if (!exists && repeatIndex > 0 && (repeatIndex % repeatInterval) === 0) {
                    repeatIndex = 1;
                    stack.push(index);
                }
                else {
                    repeatIndex++;
                }
            }
            return stack;
        }
        return isNaN(+val) ? val : +val;
    }
    static #parseNthDay(val, options) {
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
    static #isValidConstraintChar(constraints, value) {
        return constraints.chars.some((char) => value.toString().includes(char));
    }
    static get predefined() {
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
exports.CronExpressionParser = CronExpressionParser;
