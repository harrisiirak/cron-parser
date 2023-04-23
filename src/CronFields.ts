import {DayOfTheMonthRange, DayOfTheWeekRange, HourRange, MonthRange, SixtyRange} from '../types';
import {CronConstants, CronConstraints} from './CronConstants';
import {stringifyField} from './field_stringify';
import assert from 'assert';

export type CronFieldTypes = SixtyRange[] | HourRange[] | DayOfTheMonthRange[] | MonthRange[] | DayOfTheWeekRange[];

export type CronFieldsParams = {
    second: SixtyRange[];
    minute: SixtyRange[];
    hour: HourRange[];
    dayOfMonth: DayOfTheMonthRange[];
    month: MonthRange[];
    dayOfWeek: DayOfTheWeekRange[];
}


export class CronFields {
    readonly #second: SixtyRange[];
    readonly #minute: SixtyRange[];
    readonly #hour: HourRange[];
    readonly #dayOfMonth: DayOfTheMonthRange[];
    readonly #month: MonthRange[];
    readonly #dayOfWeek: DayOfTheWeekRange[];

    constructor({second, minute, hour, dayOfMonth, month, dayOfWeek}: CronFieldsParams) {
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

    stringify(includeSeconds = false): string {
        const {constraints} = CronConstants;
        const dayOfWeek = this.#dayOfWeek;
        const arr = [];
        if (includeSeconds) {
            // second
            arr.push(stringifyField(this.#second, constraints.second.min, constraints.second.max));
        }
        const dayOfMonthMax = this.#month.length === 1 ? CronConstants.daysInMonth[this.#month[0] - 1] : constraints.dayOfMonth.max;
        arr.push(
            // minute
            stringifyField(this.#minute, constraints.minute.min, constraints.minute.max),
            // hour
            stringifyField(this.#hour, constraints.hour.min, constraints.hour.max),
            // dayOfMonth
            stringifyField(this.#dayOfMonth, constraints.dayOfMonth.min, dayOfMonthMax),
            // month
            stringifyField(this.#month, constraints.month.min, constraints.month.max),
            // dayOfWeek
            stringifyField(dayOfWeek[dayOfWeek.length - 1] === 7 ? dayOfWeek.slice(0, -1) : dayOfWeek, constraints.dayOfWeek.min, 6),
        );
        return arr.join(' ');
    }

    // FIXME: validateOptions
    static validateField(value: (number | string)[], field: string, month?: MonthRange[]): boolean {
        const {constraints} = CronConstants;
        assert(field in constraints, `Validation error, Field ${field} is not valid`);
        assert(value, `Validation error, Field ${field} is missing`);
        assert(Array.isArray(value), `Validation error, Field ${field} is not an array`);
        assert(value.length > 0, `Validation error, Field ${field} contains no values`);

        const {min, max, chars} = constraints[field as keyof CronConstraints];
        // check for duplicates
        const set = new Set(value);
        assert(set.size === value.length, `Validation error, Field ${field} contains duplicate values`);

        for (const item of value) {
            const isValidNumber = typeof item === 'number' && item >= min && item <= max;
            const isValidString = typeof item === 'string' && CronFields.#isValidConstraintChar(chars, item);
            assert(isValidNumber || isValidString, `Constraint error, got value ${item} expected range ${min}-${max}`);
        }
        if (field === 'dayOfMonth') {
            assert(month, 'Validation error, month is required for dayOfMonth validation');
            CronFields.#handleMaxDaysInMonth(month, value as DayOfTheMonthRange[]);
        }
        return true;
    }

    static #isValidConstraintChar(chars: string[], value: string): boolean {
        return chars.some((char) => value.toString().includes(char));
    }

    static #handleMaxDaysInMonth(month: MonthRange[], dayOfMonth: DayOfTheMonthRange[]): DayOfTheMonthRange[] {
        if (month.length === 1) {
            const daysInMonth = CronConstants.daysInMonth[month[0] - 1];
            const v = parseInt(dayOfMonth[0] as string, 10);
            assert(v <= daysInMonth, 'Invalid explicit day of month definition');

            return dayOfMonth
                .filter((dayOfMonth: number | string) => dayOfMonth === 'L' ? true : (dayOfMonth as number) <= daysInMonth)
                .sort(CronFields.fieldSorter);
        }
        return dayOfMonth;
    }

    static fieldSorter(a: number | string, b: number | string): number {
        const aIsNumber = typeof a === 'number';
        const bIsNumber = typeof b === 'number';

        if (aIsNumber && bIsNumber) {
            return a - (b as number);
        }

        if (aIsNumber) {
            return -1;
        }

        if (bIsNumber) {
            return 1;
        }

        return (a as string).localeCompare(b as string);
    }


    get second(): SixtyRange[] {
        return [...this.#second];
    }

    get minute(): SixtyRange[] {
        return [...this.#minute];
    }

    get hour(): HourRange[] {
        return [...this.#hour];
    }

    get dayOfMonth(): DayOfTheMonthRange[] {
        return [...this.#dayOfMonth];
    }

    get month(): MonthRange[] {
        return [...this.#month];
    }

    get dayOfWeek(): DayOfTheWeekRange[] {
        return [...this.#dayOfWeek];
    }
}
