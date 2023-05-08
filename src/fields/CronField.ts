import { CronChars, CronConstraints, CronFieldTypes, CronMax, CronMin, SerializedCronField } from '../types.js';
import assert from 'assert';

/**
 * Represents a field within a cron expression.
 * This is a base class and should not be instantiated directly.
 * @class CronField
 */
export abstract class CronField {
  readonly #wildcard: boolean = false;
  readonly #values: (number | string)[] = [];

  /**
   * Returns the minimum value allowed for this field.
   */
  static get min(): CronMin {
    throw new Error('min must be overridden');
  }

  /**
   * Returns the maximum value allowed for this field.
   */
  static get max(): CronMax {
    throw new Error('max must be overridden');
  }

  /**
   * Returns the allowed characters for this field.
   */
  static get chars(): CronChars[] {
    return [];
  }

  /**
   * Returns the regular expression used to validate this field.
   */
  static get validChars(): RegExp {
    return /^[,*\d/-]+$/;
  }

  /**
   * Returns the constraints for this field.
   */
  static get constraints(): CronConstraints {
    return { min: this.min, max: this.max, chars: this.chars, validChars: this.validChars };
  }


  /**
   * CronField constructor. Initializes the field with the provided values.
   * @param {number[] | string[]} values - Values for this field
   * @param {boolean} [wildcard=false] - Whether this field is a wildcard
   * @throws {TypeError} if the constructor is called directly
   * @throws {Error} if validation fails
   */
  protected constructor(values: (number | string)[], /* istanbul ignore next - we always pass a value */ wildcard = false) {
    assert(Array.isArray(values), `${this.constructor.name} Validation error, values is not an array`);
    assert(values.length > 0, `${this.constructor.name} Validation error, values contains no values`);
    this.#values = values.sort(CronField.sorter);
    this.#wildcard = wildcard;
  }

  /**
   * Returns the minimum value allowed for this field.
   * @returns {number}
   */
  get min(): number {
    // return the static value from the child class
    return (this.constructor as typeof CronField).min;
  }

  /**
   * Returns the maximum value allowed for this field.
   * @returns {number}
   */
  get max(): number {
    // return the static value from the child class
    return (this.constructor as typeof CronField).max;
  }

  /**
   * Returns an array of allowed special characters for this field.
   * @returns {string[]}
   */
  get chars(): string[] {
    // return the static value from the child class as a copy, so it can't be mutated
    return [...(this.constructor as typeof CronField).chars];
  }

  get validChars(): RegExp {
    // return the static value from the child class
    return (this.constructor as typeof CronField).validChars;
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
    // return a copy of the values, so they can't be mutated
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
    if (!aIsNumber && !bIsNumber) return (a as string).localeCompare(b as string);
    return aIsNumber ? /* istanbul ignore next - A will always be a number until L-2 is supported */ -1 : 1;
  }

  /**
   * Serializes the field to an object.
   * @todo This is really only for debugging, should it be removed?
   * @returns {SerializedCronField}
   */
  serialize(): SerializedCronField {
    return {
      wildcard: this.#wildcard,
      values: this.#values,
    };
  }

  /**
   * Validates the field values against the allowed range and special characters.
   * @throws {Error} if validation fails
   */
  validate(): void {
    let badValue: number | string | undefined;
    const charsString = this.chars.length > 0 ? ` or chars ${this.chars.join('')}` : '';

    const charTest = (value: string) => (char: string) => (new RegExp(`^\\d{0,2}${char}$`)).test(value);
    const rangeTest = (value: number | string) => {
      badValue = value;
      return typeof value === 'number' ? value >= this.min && value <= this.max : this.chars.some(charTest(value));
    };
    const isValidRange = this.#values.every(rangeTest);
    assert(isValidRange, `${this.constructor.name} Validation error, got value ${badValue} expected range ${this.min}-${this.max}${charsString}`);
    // check for duplicate value in this.#values array
    const duplicate = this.#values.find((value, index) => this.#values.indexOf(value) !== index);
    assert(!duplicate,`${this.constructor.name} Validation error, duplicate values found: ${duplicate}`);
  }
}
