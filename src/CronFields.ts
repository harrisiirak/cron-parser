import {CronConstants, CronConstraints} from './CronConstants';
import assert from 'assert';
import {ICronFieldsParams, CronFieldTypes, DayOfTheMonthRange, DayOfTheWeekRange, HourRange, MonthRange, IRange, SixtyRange} from './types';

type ElementType = number | 'L' | 'W';

interface FieldRange {
  start: ElementType;
  count: number;
  end?: number;
  step?: number;
}

export class CronFields {
  readonly #second: SixtyRange[];
  readonly #minute: SixtyRange[];
  readonly #hour: HourRange[];
  readonly #dayOfMonth: DayOfTheMonthRange[];
  readonly #month: MonthRange[];
  readonly #dayOfWeek: DayOfTheWeekRange[];

  constructor({second, minute, hour, dayOfMonth, month, dayOfWeek}: ICronFieldsParams) {
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

  static stringifyField(arr: CronFieldTypes, min: number, max: number): string {
    // FIXME: arr as unknown as number[]
    const ranges = CronFields.compactField(arr as unknown as number[]);

    if (ranges.length === 1) {
      const singleRangeResult = CronFields.#handleSingleRange(ranges[0], min, max);
      if (singleRangeResult) return singleRangeResult;
    }

    return ranges.map(range => range.count === 1 ? range.start.toString() : CronFields.#handleMultipleRanges(range, max)).join(',');
  }

  static fieldSorter(a: number | string, b: number | string): number {
    const aIsNumber = typeof a === 'number';
    const bIsNumber = typeof b === 'number';
    if (aIsNumber && bIsNumber) return (a as number) - (b as number);
    if (!aIsNumber && !bIsNumber) return (a as string).localeCompare(b as string);
    return aIsNumber ? -1 : 1;
  }

  static compactField(input: ElementType[]): FieldRange[] {
    if (input.length === 0) {
      return [];
    }
    const output: FieldRange[] = [];
    let current: FieldRange | undefined = undefined;

    input.forEach((item, i, arr) => {
      if (current === undefined) {
        current = { start: item, count: 1 };
        return;
      }

      const prevItem = arr[i - 1] || current.start;
      const nextItem = arr[i + 1];

      if (item === 'L' || item === 'W') {
        output.push(current);
        output.push({ start: item, count: 1 });
        current = undefined;
        return;
      }

      if (current.step === undefined && nextItem !== undefined) {
        const step = item - (prevItem as number);
        const nextStep = (nextItem as number) - item;

        if (step <= nextStep) {
          current = { ...current, count: 2, end: item, step };
          return;
        }
        current.step = 1;
      }

      if (item - (current.end ?? 0) === current.step) {
        current.count++;
        current.end = item;
      } else {
        if (current.count === 1) {
          output.push({ start: current.start, count: 1 });
        } else if (current.count === 2) {
          output.push({ start: current.start, count: 1 });
          output.push({ start: current.end ?? prevItem, count: 1 });
        } else {
          output.push(current);
        }
        current = { start: item, count: 1 };
      }
    });

    if (current) {
      output.push(current);
    }
    return output;
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

  static #handleSingleRange(range: FieldRange, min: number, max: number): string | null {
    const step = range.step;
    if (step === 1 && range.start === min && range.end === max) return '*';
    if (!step) return null;
    if (step !== 1 && range.start === min && range.end === max - step + 1) return `*/${step}`;
    return null;
  }

  static #handleMultipleRanges(range: FieldRange, max: number): string {
    const step = range.step;
    if (step === 1) return `${range.start}-${range.end}`;

    const multiplier = range.start === 0 ? range.count - 1 : range.count;
    assert(step, 'Unexpected range step');
    assert(range.end, 'Unexpected range end');
    if (step * multiplier > range.end) {
      const mapFn = (_: number, index: number) => {
        assert(typeof range.start === 'number', 'Unexpected range start');
        return index % step === 0 ? range.start + index : null;
      };
      assert(typeof range.start === 'number', 'Unexpected range start');
      const seed = {length: range.end - range.start + 1};
      return Array.from(seed, mapFn).filter(value => value !== null).join(',');
    }

    return range.end === max - step + 1 ? `${range.start}/${step}` : `${range.start}-${range.end}/${step}`;
  }

  stringify(includeSeconds = false): string {
    const {constraints} = CronConstants;
    const dayOfWeek = this.#dayOfWeek;
    const arr = [];
    if (includeSeconds) {
      arr.push(CronFields.stringifyField(this.#second, constraints.second.min, constraints.second.max)); // second
    }
    const dayOfMonthMax = this.#month.length === 1 ? CronConstants.daysInMonth[this.#month[0] - 1] : constraints.dayOfMonth.max;
    const dayOfWeekVal = dayOfWeek[dayOfWeek.length - 1] === 7 ? dayOfWeek.slice(0, -1) : dayOfWeek;
    arr.push(
      CronFields.stringifyField(this.#minute, constraints.minute.min, constraints.minute.max),   // minute
      CronFields.stringifyField(this.#hour, constraints.hour.min, constraints.hour.max),         // hour
      CronFields.stringifyField(this.#dayOfMonth, constraints.dayOfMonth.min, dayOfMonthMax),    // dayOfMonth
      CronFields.stringifyField(this.#month, constraints.month.min, constraints.month.max),      // month
      CronFields.stringifyField(dayOfWeekVal, constraints.dayOfWeek.min, 6),                // dayOfWeek
    );
    return arr.join(' ');
  }
}
