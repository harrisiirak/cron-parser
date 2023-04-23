"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronFields = void 0;
const CronConstants_1 = require("./CronConstants");
const field_stringify_1 = require("./field_stringify");
const assert_1 = __importDefault(require("assert"));
class CronFields {
    #second;
    #minute;
    #hour;
    #dayOfMonth;
    #month;
    #dayOfWeek;
    constructor({ second, minute, hour, dayOfMonth, month, dayOfWeek }) {
        CronFields.validateField(second, 'second');
        CronFields.validateField(minute, 'minute');
        CronFields.validateField(hour, 'hour');
        CronFields.validateField(month, 'month');
        CronFields.validateField(dayOfMonth, 'dayOfMonth', month);
        CronFields.validateField(dayOfWeek, 'dayOfWeek');
        // FIXME: this is ugly need to separate the logic in #handleMaxDaysInMonth
        dayOfMonth = CronFields.#handleMaxDaysInMonth(month, dayOfMonth);
        this.#second = second.sort(CronFields.fieldSorter);
        this.#minute = minute.sort(CronFields.fieldSorter);
        this.#hour = hour.sort(CronFields.fieldSorter);
        this.#dayOfMonth = dayOfMonth.sort(CronFields.fieldSorter);
        this.#month = month.sort(CronFields.fieldSorter);
        this.#dayOfWeek = dayOfWeek.sort(CronFields.fieldSorter);
    }
    stringify(includeSeconds = false) {
        const { constraints } = CronConstants_1.CronConstants;
        const dayOfWeek = this.#dayOfWeek;
        const arr = [];
        if (includeSeconds) {
            // second
            arr.push((0, field_stringify_1.stringifyField)(this.#second, constraints.second.min, constraints.second.max));
        }
        const dayOfMonthMax = this.#month.length === 1 ? CronConstants_1.CronConstants.daysInMonth[this.#month[0] - 1] : constraints.dayOfMonth.max;
        arr.push(
        // minute
        (0, field_stringify_1.stringifyField)(this.#minute, constraints.minute.min, constraints.minute.max), 
        // hour
        (0, field_stringify_1.stringifyField)(this.#hour, constraints.hour.min, constraints.hour.max), 
        // dayOfMonth
        (0, field_stringify_1.stringifyField)(this.#dayOfMonth, constraints.dayOfMonth.min, dayOfMonthMax), 
        // month
        (0, field_stringify_1.stringifyField)(this.#month, constraints.month.min, constraints.month.max), 
        // dayOfWeek
        (0, field_stringify_1.stringifyField)(dayOfWeek[dayOfWeek.length - 1] === 7 ? dayOfWeek.slice(0, -1) : dayOfWeek, constraints.dayOfWeek.min, 6));
        return arr.join(' ');
    }
    // FIXME: validateOptions
    static validateField(value, field, month) {
        const { constraints } = CronConstants_1.CronConstants;
        (0, assert_1.default)(field in constraints, `Validation error, Field ${field} is not valid`);
        (0, assert_1.default)(value, `Validation error, Field ${field} is missing`);
        (0, assert_1.default)(Array.isArray(value), `Validation error, Field ${field} is not an array`);
        (0, assert_1.default)(value.length > 0, `Validation error, Field ${field} contains no values`);
        const { min, max, chars } = constraints[field];
        // check for duplicates
        const set = new Set(value);
        (0, assert_1.default)(set.size === value.length, `Validation error, Field ${field} contains duplicate values`);
        for (const item of value) {
            const isValidNumber = typeof item === 'number' && item >= min && item <= max;
            const isValidString = typeof item === 'string' && CronFields.#isValidConstraintChar(chars, item);
            (0, assert_1.default)(isValidNumber || isValidString, `Constraint error, got value ${item} expected range ${min}-${max}`);
        }
        if (field === 'dayOfMonth') {
            (0, assert_1.default)(month, 'Validation error, month is required for dayOfMonth validation');
            CronFields.#handleMaxDaysInMonth(month, value);
        }
        return true;
    }
    static #isValidConstraintChar(chars, value) {
        return chars.some((char) => value.toString().includes(char));
    }
    static #handleMaxDaysInMonth(month, dayOfMonth) {
        if (month.length === 1) {
            const daysInMonth = CronConstants_1.CronConstants.daysInMonth[month[0] - 1];
            const v = parseInt(dayOfMonth[0], 10);
            (0, assert_1.default)(v <= daysInMonth, 'Invalid explicit day of month definition');
            return dayOfMonth
                .filter((dayOfMonth) => dayOfMonth === 'L' ? true : dayOfMonth <= daysInMonth)
                .sort(CronFields.fieldSorter);
        }
        return dayOfMonth;
    }
    static fieldSorter(a, b) {
        const aIsNumber = typeof a === 'number';
        const bIsNumber = typeof b === 'number';
        if (aIsNumber && bIsNumber) {
            return a - b;
        }
        if (aIsNumber) {
            return -1;
        }
        if (bIsNumber) {
            return 1;
        }
        return a.localeCompare(b);
    }
    get second() {
        return [...this.#second];
    }
    get minute() {
        return [...this.#minute];
    }
    get hour() {
        return [...this.#hour];
    }
    get dayOfMonth() {
        return [...this.#dayOfMonth];
    }
    get month() {
        return [...this.#month];
    }
    get dayOfWeek() {
        return [...this.#dayOfWeek];
    }
}
exports.CronFields = CronFields;
