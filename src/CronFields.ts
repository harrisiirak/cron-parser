import {CronConstants} from './CronConstants';
import assert from 'assert';
import {CronFieldTypes, DayOfTheMonthRange, DayOfTheWeekRange, HourRange, ICronFieldsParams, MonthRange, SixtyRange} from './types';
import {CronSecond} from './fields/CronSecond';
import {CronMinute} from './fields/CronMinute';
import {CronHour} from './fields/CronHour';
import {CronDayOfMonth} from './fields/CronDayOfMonth';
import {CronMonth} from './fields/CronMonth';
import {CronDayOfTheWeek} from './fields/CronDayOfTheWeek';

export {
  CronSecond,
  CronMinute,
  CronHour,
  CronDayOfMonth,
  CronMonth,
  CronDayOfTheWeek
};

type ElementType = number | 'L' | 'W';

interface FieldRange {
  start: ElementType;
  count: number;
  end?: number;
  step?: number;
}

export class CronFields {
  readonly #second: CronSecond;
  readonly #minute: CronMinute;
  readonly #hour: CronHour;
  readonly #dayOfMonth: CronDayOfMonth;
  readonly #month: CronMonth;
  readonly #dayOfWeek: CronDayOfTheWeek;

  constructor({second, minute, hour, dayOfMonth, month, dayOfWeek}: ICronFieldsParams) {
    // FIXME: this is ugly need to separate the logic in #handleMaxDaysInMonth
    if (!(dayOfMonth instanceof CronDayOfMonth)) {
      if (month instanceof CronMonth) {
        throw new Error('Validation error, month must not be an instance of CronMonth when dayOfMonth is not an instance of CronDayOfMonth');
      }
      dayOfMonth = CronFields.#handleMaxDaysInMonth(month, dayOfMonth);
    } else {
      if (month instanceof CronMonth) {
        CronFields.#handleMaxDaysInMonth(month.values, dayOfMonth.values);
      } else {
        throw new Error('Validation error, month must be an instance of CronMonth when dayOfMonth is an instance of CronDayOfMonth');
      }
    }
    assert(second, 'Validation error, Field second is missing');
    assert(minute, 'Validation error, Field minute is missing');
    assert(hour, 'Validation error, Field hour is missing');
    assert(dayOfMonth, 'Validation error, Field dayOfMonth is missing');
    assert(month, 'Validation error, Field month is missing');
    assert(dayOfWeek, 'Validation error, Field dayOfWeek is missing');

    this.#second = second instanceof CronSecond ? second : new CronSecond(second);
    this.#minute = minute instanceof CronMinute ? minute : new CronMinute(minute);
    this.#hour = hour instanceof CronHour ? hour : new CronHour(hour);
    this.#dayOfMonth = dayOfMonth instanceof CronDayOfMonth ? dayOfMonth : new CronDayOfMonth(dayOfMonth);
    this.#month = month instanceof CronMonth ? month : new CronMonth(month);
    this.#dayOfWeek = dayOfWeek instanceof CronDayOfTheWeek ? dayOfWeek : new CronDayOfTheWeek(dayOfWeek);
  }

  get second(): CronSecond {
    return this.#second;
  }

  get minute(): CronMinute {
    return this.#minute;
  }

  get hour(): CronHour {
    return this.#hour;
  }

  get dayOfMonth(): CronDayOfMonth {
    return this.#dayOfMonth;
  }

  get month(): CronMonth {
    return this.#month;
  }

  get dayOfWeek(): CronDayOfTheWeek {
    return this.#dayOfWeek;
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
        current = {start: item, count: 1};
        return;
      }

      const prevItem = arr[i - 1] || current.start;
      const nextItem = arr[i + 1];

      if (item === 'L' || item === 'W') {
        output.push(current);
        output.push({start: item, count: 1});
        current = undefined;
        return;
      }

      if (current.step === undefined && nextItem !== undefined) {
        const step = item - (prevItem as number);
        const nextStep = (nextItem as number) - item;

        if (step <= nextStep) {
          current = {...current, count: 2, end: item, step};
          return;
        }
        current.step = 1;
      }

      if (item - (current.end ?? 0) === current.step) {
        current.count++;
        current.end = item;
      } else {
        if (current.count === 1) {
          output.push({start: current.start, count: 1});
        } else if (current.count === 2) {
          output.push({start: current.start, count: 1});
          output.push({start: current.end ?? prevItem, count: 1});
        } else {
          output.push(current);
        }
        current = {start: item, count: 1};
      }
    });

    if (current) {
      output.push(current);
    }
    return output;
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
    if (step === 1 && range.start === min && range.end && range.end >= max) return '*';
    if (!step) return null;
    if (step !== 1 && range.start === min && range.end && range.end >= max - step + 1) return `*/${step}`;
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
    const dayOfWeek = this.#dayOfWeek.values;
    const arr = [];
    if (includeSeconds) {
      arr.push(CronFields.stringifyField(this.#second.values, constraints.second.min, constraints.second.max)); // second
    }
    const dayOfMonthMax = this.#month.values.length === 1 ? CronConstants.daysInMonth[this.#month.values[0] - 1] : constraints.dayOfMonth.max;
    const dayOfWeekVal = dayOfWeek[dayOfWeek.length - 1] === 7 ? dayOfWeek.slice(0, -1) : dayOfWeek;

    arr.push(
      CronFields.stringifyField(this.#minute.values, constraints.minute.min, constraints.minute.max),   // minute
      CronFields.stringifyField(this.#hour.values, constraints.hour.min, constraints.hour.max),         // hour
      CronFields.stringifyField(this.#dayOfMonth.values, constraints.dayOfMonth.min, dayOfMonthMax),    // dayOfMonth
      CronFields.stringifyField(this.#month.values, constraints.month.min, constraints.month.max),      // month
      CronFields.stringifyField(dayOfWeekVal, constraints.dayOfWeek.min, 6),                // dayOfWeek
    );
    return arr.join(' ');
  }

  debug(): { second: SixtyRange[], minute: SixtyRange[], hour: HourRange[], dayOfMonth: DayOfTheMonthRange[], month: MonthRange[], dayOfWeek: DayOfTheWeekRange[] } {
    return {
      second: this.#second.values,
      minute: this.#minute.values,
      hour: this.#hour.values,
      dayOfMonth: this.#dayOfMonth.values,
      month: this.#month.values,
      dayOfWeek: this.#dayOfWeek.values,
    };
  }
}
