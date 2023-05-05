import { CronChars, CronFieldTypes, CronMax, CronMin, SerializedCronField } from '../types';
import assert from 'assert';

/**
 * Represents a field within a cron expression.
 * This is a base class and should not be instantiated directly.
 * @class CronField
 */
export class CronField {
  readonly #wildcard: boolean = false;
  readonly #values: (number | string)[] = [];
  readonly #min: CronMin = 0;
  readonly #max: CronMax = 59;
  readonly #chars: CronChars[] = [];

  /**
   * CronField constructor. Initializes the field with the provided values.
   * @param {number[] | string[]} values - Values for this field
   * @param {CronMin} min - Minimum allowed value for this field
   * @param {CronMax} max - Maximum allowed value for this field
   * @param {CronChars[]} chars - Array of allowed special characters for this field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   * @throws {TypeError} if the constructor is called directly
   * @throws {Error} if validation fails
   */
  constructor(
    values: (number | string)[],
    min: CronMin,
    max: CronMax,
    chars: CronChars[],
    /* istanbul ignore next - we always pass a value */ wildcard = false,
  ) {
    // only child classes can call this constructor
    if (new.target === CronField) {
      throw new TypeError('Cannot construct CronField instances directly');
    }
    assert(
      Array.isArray(values),
      `${this.constructor.name} Validation error, values is not an array`,
    );
    assert(
      values.length > 0,
      `${this.constructor.name} Validation error, values contains no values`,
    );
    assert(
      [0, 1].includes(min),
      `${this.constructor.name} Validation error, min is not valid, value: ${min}`,
    );
    assert(
      [7, 12, 23, 31, 59].includes(max),
      `${this.constructor.name} Validation error, max is not valid, value: ${max}`,
    );

    this.#min = min;
    this.#max = max;
    this.#chars = chars;
    this.#values = values.sort(CronField.sorter);
    this.#wildcard = wildcard;
  }

  /**
   * Returns the minimum value allowed for this field.
   * @returns {number}
   */
  get min(): number {
    return this.#min;
  }

  /**
   * Returns the maximum value allowed for this field.
   * @returns {number}
   */
  get max(): number {
    return this.#max;
  }

  /**
   * Returns an array of allowed special characters for this field.
   * @returns {string[]}
   */
  get chars(): string[] {
    return [...this.#chars];
  }

  /**
   * Indicates whether this field is a wildcard.
   * @returns {boolean}
   */
  get isWildcard(): boolean {
    return this.#wildcard;
  }

  /**
   * Returns an array of allowed values for this field.
   * @returns {CronFieldTypes}
   */
  get values(): CronFieldTypes {
    return [...this.#values] as CronFieldTypes;
  }

  /**
   * Helper function to sort values in ascending order.
   * @param {number | string} a - First value to compare
   * @param {number | string} b - Second value to compare
   * @returns {number} - A negative, zero, or positive value, depending on the sort order
   */
  static sorter(a: number | string, b: number | string): number {
    const aIsNumber = typeof a === 'number';
    const bIsNumber = typeof b === 'number';
    if (aIsNumber && bIsNumber) return (a as number) - (b as number);
    if (!aIsNumber && !bIsNumber)
      return (a as string).localeCompare(b as string);
    return aIsNumber
      ? /* istanbul ignore next - A will always be a number until L-2 is supported */ -1
      : 1;
  }

  /**
   * Serializes the field to an object.
   * @returns {SerializedCronField}
   */
  serialize(): SerializedCronField {
    return {
      wildcard: this.#wildcard,
      values: this.#values,
      min: this.#min,
      max: this.#max,
      chars: this.#chars,
    };
  }

  /**
   * Validates the field values against the allowed range and special characters.
   * @throws {Error} if validation fails
   */
  validate(): void {
    let badValue: number | string | undefined;
    const charsString =
      this.chars.length > 0 ? ` or chars ${this.chars.join('')}` : '';
    const isValid = this.#values.every((value) => {
      badValue = value;
      if (typeof value === 'number') {
        return value >= this.min && value <= this.max;
      }
      return this.chars.some((char) => {
        const regex = new RegExp(`^\\d{0,2}${char}$`);
        return regex.test(value);
      });
    });
    assert(
      isValid,
      `${this.constructor.name} Validation error, got value ${badValue} expected range ${this.min}-${this.max}${charsString}`,
    );
    // check for duplicates
    assert(
      this.#values.every((value, index) => {
        badValue = value;
        return this.#values.indexOf(value) === index;
      }),
      `${this.constructor.name} Validation error, duplicate values found: ${badValue}`,
    );
  }
}
