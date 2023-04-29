import {CronChars, CronFieldTypes, CronMax, CronMin} from '../types';
import assert from 'assert';

type SerializedCronField = {
  wildcard: boolean;
  values: (number | string)[];
  min: CronMin;
  max: CronMax;
  chars: CronChars[];
}

export class CronField {
  readonly #wildcard: boolean = false;
  readonly #values: (number | string)[] = [];
  readonly #min: CronMin = 0;
  readonly #max: CronMax = 59;
  readonly #chars: CronChars[] = [];

  get min(): number {
    return this.#min;
  }

  get max(): number {
    return this.#max;
  }

  get chars(): string[] {
    return [...this.#chars];
  }

  get isWildcard(): boolean {
    return this.#wildcard;
  }

  get values(): CronFieldTypes {
    return [...this.#values] as CronFieldTypes;
  }

  serialize(): SerializedCronField {
    return {
      wildcard: this.#wildcard,
      values: this.#values,
      min: this.#min,
      max: this.#max,
      chars: this.#chars
    };
  }

  validate(): void {
    let badValue: number | string | undefined;
    const charsString = this.chars.length > 0 ? ` or chars ${this.chars.join('')}` : '';
    assert(this.#values.every(value => {
      badValue = value;
      if (typeof value === 'number') {
        return value >= this.min && value <= this.max;
      }
      return this.chars.some(char => {
        const regex = new RegExp(`^\\d{0,2}${char}$`);
        return regex.test(value);
      });
    }), `${this.constructor.name} Validation error, got value ${badValue} expected range ${this.min}-${this.max}${charsString}`);
    // check for duplicates
    assert(this.#values.every((value, index) => {
      badValue = value;
      return this.#values.indexOf(value) === index;
    }), `${this.constructor.name} Validation error, duplicate values found: ${badValue}`);
  }

  constructor(values: (number | string)[], min: CronMin, max: CronMax, chars: CronChars[], wildcard = false) {
    // only child classes can call this constructor
    if (new.target === CronField) {
      throw new TypeError('Cannot construct CronField instances directly');
    }
    assert(Array.isArray(values), `${this.constructor.name} Validation error, values is not an array`);
    assert(values.length > 0, `${this.constructor.name} Validation error, values contains no values`);
    assert([0, 1].includes(min), `${this.constructor.name} Validation error, min is not valid, value: ${min}`);
    assert([7, 12, 23, 31, 59].includes(max), `${this.constructor.name} Validation error, max is not valid, value: ${max}`);

    this.#min = min;
    this.#max = max;
    this.#chars = chars;
    this.#values = values.sort(CronField.sorter);
    this.#wildcard = wildcard;
  }

  static sorter(a: number | string, b: number | string): number {
    const aIsNumber = typeof a === 'number';
    const bIsNumber = typeof b === 'number';
    if (aIsNumber && bIsNumber) return (a as number) - (b as number);
    if (!aIsNumber && !bIsNumber) return (a as string).localeCompare(b as string);
    return aIsNumber ? -1 : 1;
  }
}
