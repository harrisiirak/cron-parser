import { CronConstants } from './CronConstants';
import assert from 'assert';
import {
  CronChars,
  DayOfTheMonthRange,
  ICronFields,
  IFieldRange,
  MonthRange,
  SerializedCronFields,
} from './types';
import { CronSecond } from './fields/CronSecond';
import { CronMinute } from './fields/CronMinute';
import { CronHour } from './fields/CronHour';
import { CronDayOfMonth } from './fields/CronDayOfMonth';
import { CronMonth } from './fields/CronMonth';
import { CronDayOfTheWeek } from './fields/CronDayOfTheWeek';
import { CronField } from './fields/CronField';

export {
  CronSecond,
  CronMinute,
  CronHour,
  CronDayOfMonth,
  CronMonth,
  CronDayOfTheWeek,
};

/**
 * Represents a complete set of cron fields.
 * @class CronFields
 */
export class CronFields {
  readonly #second: CronSecond;
  readonly #minute: CronMinute;
  readonly #hour: CronHour;
  readonly #dayOfMonth: CronDayOfMonth;
  readonly #month: CronMonth;
  readonly #dayOfWeek: CronDayOfTheWeek;

  /**
   * CronFields constructor. Initializes the cron fields with the provided values.
   * @param {ICronFields} param0 - The cron fields values
   * @throws {Error} if validation fails
   */
  constructor({
    second,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
  }: ICronFields) {
    // FIXME: this is ugly need to separate the logic in #handleMaxDaysInMonth
    if (!(dayOfMonth instanceof CronDayOfMonth)) {
      /* istanbul ignore next - needs to be refactored */
      if (month instanceof CronMonth) {
        /* istanbul ignore next - needs to be refactored */
        throw new Error(
          'Validation error, month must not be an instance of CronMonth when dayOfMonth is not an instance of CronDayOfMonth',
        );
      }
      dayOfMonth = CronFields.#handleMaxDaysInMonth(month, dayOfMonth);
    } else {
      if (month instanceof CronMonth) {
        CronFields.#handleMaxDaysInMonth(month.values, dayOfMonth.values);
      } else {
        throw new Error(
          'Validation error, month must be an instance of CronMonth when dayOfMonth is an instance of CronDayOfMonth',
        );
      }
    }
    assert(second, 'Validation error, Field second is missing');
    assert(minute, 'Validation error, Field minute is missing');
    assert(hour, 'Validation error, Field hour is missing');
    assert(dayOfMonth, 'Validation error, Field dayOfMonth is missing');
    assert(month, 'Validation error, Field month is missing');
    assert(dayOfWeek, 'Validation error, Field dayOfWeek is missing');

    this.#second =
      second instanceof CronSecond ? second : new CronSecond(second);
    this.#minute =
      minute instanceof CronMinute ? minute : new CronMinute(minute);
    this.#hour = hour instanceof CronHour ? hour : new CronHour(hour);
    this.#dayOfMonth =
      dayOfMonth instanceof CronDayOfMonth
        ? dayOfMonth
        : new CronDayOfMonth(dayOfMonth);
    this.#month = month instanceof CronMonth ? month : new CronMonth(month);
    this.#dayOfWeek =
      dayOfWeek instanceof CronDayOfTheWeek
        ? dayOfWeek
        : new CronDayOfTheWeek(dayOfWeek);
  }

  /**
   * Returns the second field.
   * @returns {CronSecond}
   */
  get second(): CronSecond {
    return this.#second;
  }

  /**
   * Returns the minute field.
   * @returns {CronMinute}
   */
  get minute(): CronMinute {
    return this.#minute;
  }

  /**
   * Returns the hour field.
   * @returns {CronHour}
   */
  get hour(): CronHour {
    return this.#hour;
  }

  /**
   * Returns the day of the month field.
   * @returns {CronDayOfMonth}
   */
  get dayOfMonth(): CronDayOfMonth {
    return this.#dayOfMonth;
  }

  /**
   * Returns the month field.
   * @returns {CronMonth}
   */
  get month(): CronMonth {
    return this.#month;
  }

  /**
   * Returns the day of the week field.
   * @returns {CronDayOfTheWeek}
   */
  get dayOfWeek(): CronDayOfTheWeek {
    return this.#dayOfWeek;
  }

  /**
   * Returns a string representation of the cron fields.
   * @param {(number | CronChars)[]} input - The cron fields values
   * @static
   * @returns {IFieldRange[]} - The compacted cron fields
   */
  static compactField(input: (number | CronChars)[]): IFieldRange[] {
    if (input.length === 0) {
      return [];
    }

    // Initialize the output array and current IFieldRange
    const output: IFieldRange[] = [];
    let current: IFieldRange | undefined = undefined;

    input.forEach((item, i, arr) => {
      // If the current IFieldRange is undefined, create a new one with the current item as the start.
      if (current === undefined) {
        current = { start: item, count: 1 };
        return;
      }

      // Cache the previous and next items in the array.
      const prevItem = arr[i - 1] || current.start;
      const nextItem = arr[i + 1];

      // If the current item is 'L' or 'W', push the current IFieldRange to the output and
      // create a new IFieldRange with the current item as the start.
      // 'L' and 'W' characters are special cases that need to be handled separately.
      if (item === 'L' || item === 'W') {
        output.push(current);
        output.push({ start: item, count: 1 });
        current = undefined;
        return;
      }

      // If the current step is undefined and there is a next item, update the current IFieldRange.
      // This block checks if the current step needs to be updated and does so if needed.
      if (current.step === undefined && nextItem !== undefined) {
        const step = item - (prevItem as number);
        const nextStep = (nextItem as number) - item;

        // If the current step is less or equal to the next step, update the current IFieldRange to include the current item.
        if (step <= nextStep) {
          current = { ...current, count: 2, end: item, step };
          return;
        }
        current.step = 1;
      }

      // If the difference between the current item and the current end is equal to the current step,
      // update the current IFieldRange's count and end.
      // This block checks if the current item is part of the current range and updates the range accordingly.
      if (item - (current.end ?? 0) === current.step) {
        current.count++;
        current.end = item;
      } else {
        // If the count is 1, push a new IFieldRange with the current start.
        // This handles the case where the current range has only one element.
        if (current.count === 1) {
          // If the count is 2, push two separate IFieldRanges, one for each element.
          output.push({ start: current.start, count: 1 });
        } else if (current.count === 2) {
          output.push({ start: current.start, count: 1 });
          // current.end can never be undefined here but typescript doesn't know that
          // this is why we ?? it and then ignore the prevItem in the coverage
          output.push({
            start:
              current.end ?? /* istanbul ignore next - see above */ prevItem,
            count: 1,
          });
        } else {
          // Otherwise, push the current IFieldRange to the output.
          output.push(current);
        }
        // Reset the current IFieldRange with the current item as the start.
        current = { start: item, count: 1 };
      }
    });

    // Push the final IFieldRange, if any, to the output array.
    if (current) {
      output.push(current);
    }
    return output;
  }

  /**
   * Handles a single range.
   * @param {MonthRange[]} month The month range.
   * @param {DayOfTheMonthRange[]} dayOfMonth The day of the month range.
   * @returns {DayOfTheMonthRange[]} The day of the month range.
   * @private
   */
  static #handleMaxDaysInMonth(
    month: MonthRange[],
    dayOfMonth: DayOfTheMonthRange[],
  ): DayOfTheMonthRange[] {
    if (month.length === 1) {
      const daysInMonth = CronConstants.daysInMonth[month[0] - 1];
      const v = parseInt(dayOfMonth[0] as string, 10);
      assert(v <= daysInMonth, 'Invalid explicit day of month definition');

      return dayOfMonth.filter((dayOfMonth: number | string) =>
        dayOfMonth === 'L' ? true : (dayOfMonth as number) <= daysInMonth,
      );
    }
    return dayOfMonth;
  }

  /**
   * Handles a single range.
   * @param {IFieldRange} range {start: number, end: number, step: number, count: number} The range to handle.
   * @param {number} min The minimum value for the field.
   * @param {number} max The maximum value for the field.
   * @returns {string | null} The stringified range or null if it cannot be stringified.
   * @private
   */
  static #handleSingleRange(
    range: IFieldRange,
    min: number,
    max: number,
  ): string | null {
    const step = range.step;
    if (!step) {
      return null;
    }
    if (step === 1 && range.start === min && range.end && range.end >= max) {
      return '*';
    }
    if (
      step !== 1 &&
      range.start === min &&
      range.end &&
      range.end >= max - step + 1
    ) {
      return `*/${step}`;
    }
    return null;
  }

  /**
   * Handles multiple ranges.
   * @param {IFieldRange} range {start: number, end: number, step: number, count: number} The range to handle.
   * @param {number} max The maximum value for the field.
   * @returns {string} The stringified range.
   * @private
   */
  static #handleMultipleRanges(range: IFieldRange, max: number): string {
    const step = range.step;
    if (step === 1) {
      return `${range.start}-${range.end}`;
    }

    const multiplier = range.start === 0 ? range.count - 1 : range.count;
    assert(step, 'Unexpected range step');
    assert(range.end, 'Unexpected range end');
    if (step * multiplier > range.end) {
      const mapFn = (_: number, index: number) => {
        assert(typeof range.start === 'number', 'Unexpected range start');
        return index % step === 0 ? range.start + index : null;
      };
      assert(typeof range.start === 'number', 'Unexpected range start');
      const seed = { length: range.end - range.start + 1 };
      return Array.from(seed, mapFn)
        .filter((value) => value !== null)
        .join(',');
    }

    return range.end === max - step + 1
      ? `${range.start}/${step}`
      : `${range.start}-${range.end}/${step}`;
  }

  /**
   * Returns a string representation of the cron fields.
   * @param {CronField} field - The cron field to stringify
   * @static
   * @returns {string} - The stringified cron field
   */
  stringifyField(field: CronField): string {
    let max = field.max;
    let values = field.values;
    if (field instanceof CronDayOfTheWeek) {
      max = 6;
      const dayOfWeek = this.#dayOfWeek.values;
      values =
        dayOfWeek[dayOfWeek.length - 1] === 7
          ? dayOfWeek.slice(0, -1)
          : dayOfWeek;
    }
    if (field instanceof CronDayOfMonth) {
      max =
        this.#month.values.length === 1
          ? CronConstants.daysInMonth[this.#month.values[0] - 1]
          : field.max;
    }
    const ranges = CronFields.compactField(values);

    if (ranges.length === 1) {
      const singleRangeResult = CronFields.#handleSingleRange(
        ranges[0],
        field.min,
        max,
      );
      if (singleRangeResult) {
        return singleRangeResult;
      }
    }
    return ranges
      .map((range) =>
        range.count === 1
          ? range.start.toString()
          : CronFields.#handleMultipleRanges(range, max),
      )
      .join(',');
  }

  /**
   * Returns a string representation of the cron field values.
   * @param {boolean} includeSeconds - Whether to include seconds in the output
   * @returns {string} The formatted cron string
   */
  stringify(includeSeconds = false): string {
    const arr = [];
    if (includeSeconds) {
      arr.push(this.stringifyField(this.#second)); // second
    }

    arr.push(
      this.stringifyField(this.#minute), // minute
      this.stringifyField(this.#hour), // hour
      this.stringifyField(this.#dayOfMonth), // dayOfMonth
      this.stringifyField(this.#month), // month
      this.stringifyField(this.#dayOfWeek), // dayOfWeek
    );
    return arr.join(' ');
  }

  /**
   * Returns a serialized representation of the cron fields values.
   * @returns {SerializedCronFields} An object containing the cron field values
   */
  serialize(): SerializedCronFields {
    return {
      second: this.#second.serialize(),
      minute: this.#minute.serialize(),
      hour: this.#hour.serialize(),
      dayOfMonth: this.#dayOfMonth.serialize(),
      month: this.#month.serialize(),
      dayOfWeek: this.#dayOfWeek.serialize(),
    };
  }
}
