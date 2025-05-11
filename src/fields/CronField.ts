import { CronChars, CronConstraints, CronFieldType, CronMax, CronMin } from './types';

/**
 * Represents the serialized form of a cron field.
 * @typedef {Object} SerializedCronField
 * @property {boolean} wildcard - Indicates if the field is a wildcard.
 * @property {(number|string)[]} values - The values of the field.
 */
export type SerializedCronField = {
  wildcard: boolean;
  values: (number | string)[];
};

/**
 * Represents the options for a cron field.
 * @typedef {Object} CronFieldOptions
 * @property {string} rawValue - The raw value of the field.
 * @property {boolean} [wildcard] - Indicates if the field is a wildcard.
 * @property {number} [nthDayOfWeek] - The nth day of the week.
 */
export type CronFieldOptions = {
  rawValue: string;
  wildcard?: boolean;
  nthDayOfWeek?: number;
};

/**
 * Represents a field within a cron expression.
 * This is a base class and should not be instantiated directly.
 * @class CronField
 */
export abstract class CronField {
  readonly #hasLastChar: boolean = false;
  readonly #hasQuestionMarkChar: boolean = false;

  readonly #wildcard: boolean = false;
  readonly #values: (number | string)[] = [];

  protected readonly options: CronFieldOptions = { rawValue: '' };

  /**
   * Returns the minimum value allowed for this field.
   */
  /* istanbul ignore next */ static get min(): CronMin {
    /* istanbul ignore next */
    throw new Error('min must be overridden');
  }

  /**
   * Returns the maximum value allowed for this field.
   */
  /* istanbul ignore next */ static get max(): CronMax {
    /* istanbul ignore next */
    throw new Error('max must be overridden');
  }

  /**
   * Returns the allowed characters for this field.
   */
  /* istanbul ignore next */ static get chars(): readonly CronChars[] {
    /* istanbul ignore next - this is overridden */
    return Object.freeze([]);
  }

  /**
   * Returns the regular expression used to validate this field.
   */
  static get validChars(): RegExp {
    return /^[?,*\dH/-]+$/;
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
   * @param {CronFieldOptions} [options] - Options provided by the parser
   * @throws {TypeError} if the constructor is called directly
   * @throws {Error} if validation fails
   */
  protected constructor(
    values: (number | string)[],
    /* istanbul ignore next - we always pass a value */ options: CronFieldOptions = { rawValue: '' },
  ) {
    if (!Array.isArray(values)) {
      throw new Error(`${this.constructor.name} Validation error, values is not an array`);
    }
    if (!(values.length > 0)) {
      throw new Error(`${this.constructor.name} Validation error, values contains no values`);
    }

    this.options = options;
    this.#values = values.sort(CronField.sorter);
    this.#wildcard = this.options.wildcard !== undefined ? this.options.wildcard : this.#isWildcardValue();
    this.#hasLastChar = this.options.rawValue.includes('L');
    this.#hasQuestionMarkChar = this.options.rawValue.includes('?');
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
  get chars(): readonly string[] {
    // return the frozen static value from the child class
    return (this.constructor as typeof CronField).chars;
  }

  /**
   * Indicates whether this field has a "last" character.
   * @returns {boolean}
   */
  get hasLastChar(): boolean {
    return this.#hasLastChar;
  }

  /**
   * Indicates whether this field has a "question mark" character.
   * @returns {boolean}
   */
  get hasQuestionMarkChar(): boolean {
    return this.#hasQuestionMarkChar;
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
   * @returns {CronFieldType}
   */
  get values(): CronFieldType {
    return this.#values as CronFieldType;
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

    const charTest = (value: string) => (char: string) => new RegExp(`^\\d{0,2}${char}$`).test(value);
    const rangeTest = (value: number | string) => {
      badValue = value;
      return typeof value === 'number' ? value >= this.min && value <= this.max : this.chars.some(charTest(value));
    };
    const isValidRange = this.#values.every(rangeTest);
    if (!isValidRange) {
      throw new Error(
        `${this.constructor.name} Validation error, got value ${badValue} expected range ${this.min}-${this.max}${charsString}`,
      );
    }
    // check for duplicate value in this.#values array
    const duplicate = this.#values.find((value, index) => this.#values.indexOf(value) !== index);
    if (duplicate) {
      throw new Error(`${this.constructor.name} Validation error, duplicate values found: ${duplicate}`);
    }
  }

  /**
   * Determines if the field is a wildcard based on the values.
   * When options.rawValue is not empty, it checks if the raw value is a wildcard, otherwise it checks if all values in the range are included.
   * @returns {boolean}
   */
  #isWildcardValue(): boolean {
    if (this.options.rawValue.length > 0) {
      return ['*', '?'].includes(this.options.rawValue);
    }

    return Array.from({ length: this.max - this.min + 1 }, (_, i) => i + this.min).every((value) =>
      this.#values.includes(value),
    );
  }
}
