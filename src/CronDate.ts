import { DateTime, WeekdayNumbers } from 'luxon';

export enum TimeUnit {
  Second = 'Second',
  Minute = 'Minute',
  Hour = 'Hour',
  Day = 'Day',
  Month = 'Month',
  Year = 'Year',
}

export enum DateMathOp {
  Add = 'Add',
  Subtract = 'Subtract',
}

type VerbMap = {
  [key in TimeUnit]: () => void;
};

export const DAYS_IN_MONTH: readonly number[] = Object.freeze([31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);

/**
 * CronDate class that wraps the Luxon DateTime object to provide
 * a consistent API for working with dates and times in the context of cron.
 */
export class CronDate {
  #date: DateTime;
  #dstStart: number | null = null;
  #dstEnd: number | null = null;

  /**
   * Maps the verb to the appropriate method
   */
  #verbMap: { add: VerbMap; subtract: VerbMap } = {
    add: {
      [TimeUnit.Year]: this.addYear.bind(this),
      [TimeUnit.Month]: this.addMonth.bind(this),
      [TimeUnit.Day]: this.addDay.bind(this),
      [TimeUnit.Hour]: this.addHour.bind(this),
      [TimeUnit.Minute]: this.addMinute.bind(this),
      [TimeUnit.Second]: this.addSecond.bind(this),
    },
    subtract: {
      [TimeUnit.Year]: this.subtractYear.bind(this),
      [TimeUnit.Month]: this.subtractMonth.bind(this),
      [TimeUnit.Day]: this.subtractDay.bind(this),
      [TimeUnit.Hour]: this.subtractHour.bind(this),
      [TimeUnit.Minute]: this.subtractMinute.bind(this),
      [TimeUnit.Second]: this.subtractSecond.bind(this),
    },
  };

  /**
   * Constructs a new CronDate instance.
   * @param {CronDate | Date | number | string} [timestamp] - The timestamp to initialize the CronDate with.
   * @param {string} [tz] - The timezone to use for the CronDate.
   */
  constructor(timestamp?: CronDate | Date | number | string, tz?: string) {
    const dateOpts = { zone: tz };

    // Initialize the internal DateTime object based on the type of timestamp provided.
    if (!timestamp) {
      this.#date = DateTime.local();
    } else if (timestamp instanceof CronDate) {
      this.#date = timestamp.#date;
      this.#dstStart = timestamp.#dstStart;
      this.#dstEnd = timestamp.#dstEnd;
    } else if (timestamp instanceof Date) {
      this.#date = DateTime.fromJSDate(timestamp, dateOpts);
    } else if (typeof timestamp === 'number') {
      this.#date = DateTime.fromMillis(timestamp, dateOpts);
    } else {
      this.#date = DateTime.fromISO(timestamp, dateOpts);
      this.#date.isValid || (this.#date = DateTime.fromRFC2822(timestamp, dateOpts));
      this.#date.isValid || (this.#date = DateTime.fromSQL(timestamp, dateOpts));
      this.#date.isValid || (this.#date = DateTime.fromFormat(timestamp, 'EEE, d MMM yyyy HH:mm:ss', dateOpts));
    }

    // Check for valid DateTime and throw an error if not valid.
    if (!this.#date.isValid) {
      throw new Error(`CronDate: unhandled timestamp: ${timestamp}`);
    }

    // Set the timezone if it is provided and different from the current zone.
    if (tz && tz !== this.#date.zoneName) {
      this.#date = this.#date.setZone(tz);
    }
  }

  /**
   * Determines if the given year is a leap year.
   * @param {number} year - The year to check
   * @returns {boolean} - True if the year is a leap year, false otherwise
   * @private
   */
  static #isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Returns daylight savings start time.
   * @returns {number | null}
   */
  get dstStart(): number | null {
    return this.#dstStart;
  }

  /**
   * Sets daylight savings start time.
   * @param {number | null} value
   */
  set dstStart(value: number | null) {
    this.#dstStart = value;
  }

  /**
   * Returns daylight savings end time.
   * @returns {number | null}
   */
  get dstEnd(): number | null {
    return this.#dstEnd;
  }

  /**
   * Sets daylight savings end time.
   * @param {number | null} value
   */
  set dstEnd(value: number | null) {
    this.#dstEnd = value;
  }

  /**
   * Adds one year to the current CronDate.
   */
  addYear(): void {
    this.#date = this.#date.plus({ years: 1 });
  }

  /**
   * Adds one month to the current CronDate.
   */
  addMonth(): void {
    this.#date = this.#date.plus({ months: 1 }).startOf('month');
  }

  /**
   * Adds one day to the current CronDate.
   */
  addDay(): void {
    this.#date = this.#date.plus({ days: 1 }).startOf('day');
  }

  /**
   * Adds one hour to the current CronDate.
   */
  addHour(): void {
    this.#date = this.#date.plus({ hours: 1 }).startOf('hour');
  }

  /**
   * Adds one minute to the current CronDate.
   */
  addMinute(): void {
    this.#date = this.#date.plus({ minutes: 1 }).startOf('minute');
  }

  /**
   * Adds one second to the current CronDate.
   */
  addSecond(): void {
    this.#date = this.#date.plus({ seconds: 1 });
  }

  /**
   * Subtracts one year from the current CronDate.
   */
  subtractYear(): void {
    this.#date = this.#date.minus({ years: 1 });
  }

  /**
   * Subtracts one month from the current CronDate.
   * If the month is 1, it will subtract one year instead.
   */
  subtractMonth(): void {
    this.#date = this.#date.minus({ months: 1 }).endOf('month').startOf('second');
  }

  /**
   * Subtracts one day from the current CronDate.
   * If the day is 1, it will subtract one month instead.
   */
  subtractDay(): void {
    this.#date = this.#date.minus({ days: 1 }).endOf('day').startOf('second');
  }

  /**
   * Subtracts one hour from the current CronDate.
   * If the hour is 0, it will subtract one day instead.
   */
  subtractHour(): void {
    this.#date = this.#date.minus({ hours: 1 }).endOf('hour').startOf('second');
  }

  /**
   * Subtracts one minute from the current CronDate.
   * If the minute is 0, it will subtract one hour instead.
   */
  subtractMinute(): void {
    this.#date = this.#date.minus({ minutes: 1 }).endOf('minute').startOf('second');
  }

  /**
   * Subtracts one second from the current CronDate.
   * If the second is 0, it will subtract one minute instead.
   */
  subtractSecond(): void {
    this.#date = this.#date.minus({ seconds: 1 });
  }

  /**
   * Adds a unit of time to the current CronDate.
   * @param {TimeUnit} unit
   */
  addUnit(unit: TimeUnit): void {
    this.#verbMap.add[unit]();
  }

  /**
   * Subtracts a unit of time from the current CronDate.
   * @param {TimeUnit} unit
   */
  subtractUnit(unit: TimeUnit): void {
    this.#verbMap.subtract[unit]();
  }

  /**
   * Handles a math operation.
   * @param {DateMathOp} verb - {'add' | 'subtract'}
   * @param {TimeUnit} unit - {'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'}
   */
  invokeDateOperation(verb: DateMathOp, unit: TimeUnit) {
    if (verb === DateMathOp.Add) {
      this.addUnit(unit);
      return;
    }
    if (verb === DateMathOp.Subtract) {
      this.subtractUnit(unit);
      return;
    }
    /* istanbul ignore next - this would only happen if an end user call the handleMathOp with an invalid verb */
    throw new Error(`Invalid verb: ${verb}`);
  }

  /**
   * Returns the day.
   * @returns {number}
   */
  getDate(): number {
    return this.#date.day;
  }

  /**
   * Returns the year.
   * @returns {number}
   */
  getFullYear(): number {
    return this.#date.year;
  }

  /**
   * Returns the day of the week.
   * @returns {number}
   */
  getDay(): number {
    const weekday = this.#date.weekday;
    return weekday === 7 ? 0 : weekday;
  }

  /**
   * Returns the month.
   * @returns {number}
   */
  getMonth(): number {
    return this.#date.month - 1;
  }

  /**
   * Returns the hour.
   * @returns {number}
   */
  getHours(): number {
    return this.#date.hour;
  }

  /**
   * Returns the minutes.
   * @returns {number}
   */
  getMinutes(): number {
    return this.#date.minute;
  }

  /**
   * Returns the seconds.
   * @returns {number}
   */
  getSeconds(): number {
    return this.#date.second;
  }

  /**
   * Returns the milliseconds.
   * @returns {number}
   */
  getMilliseconds(): number {
    return this.#date.millisecond;
  }

  /**
   * Returns the time.
   * @returns {number}
   */
  getTime(): number {
    return this.#date.valueOf();
  }

  /**
   * Returns the UTC day.
   * @returns {number}
   */
  getUTCDate(): number {
    return this.#getUTC().day;
  }

  /**
   * Returns the UTC year.
   * @returns {number}
   */
  getUTCFullYear(): number {
    return this.#getUTC().year;
  }

  /**
   * Returns the UTC day of the week.
   * @returns {number}
   */
  getUTCDay(): number {
    const weekday = this.#getUTC().weekday;
    return weekday === 7 ? 0 : weekday;
  }

  /**
   * Returns the UTC month.
   * @returns {number}
   */
  getUTCMonth(): number {
    return this.#getUTC().month - 1;
  }

  /**
   * Returns the UTC hour.
   * @returns {number}
   */
  getUTCHours(): number {
    return this.#getUTC().hour;
  }

  /**
   * Returns the UTC minutes.
   * @returns {number}
   */
  getUTCMinutes(): number {
    return this.#getUTC().minute;
  }

  /**
   * Returns the UTC seconds.
   * @returns {number}
   */
  getUTCSeconds(): number {
    return this.#getUTC().second;
  }

  /**
   * Returns the UTC milliseconds.
   * @returns {string | null}
   */
  toISOString(): string | null {
    return this.#date.toUTC().toISO();
  }

  /**
   * Returns the date as a JSON string.
   * @returns {string | null}
   */
  toJSON(): string | null {
    return this.#date.toJSON();
  }

  /**
   * Sets the day.
   * @param d
   */
  setDate(d: number): void {
    this.#date = this.#date.set({ day: d });
  }

  /**
   * Sets the year.
   * @param y
   */
  setFullYear(y: number): void {
    this.#date = this.#date.set({ year: y });
  }

  /**
   * Sets the day of the week.
   * @param d
   */
  setDay(d: number): void {
    this.#date = this.#date.set({ weekday: d as WeekdayNumbers });
  }

  /**
   * Sets the month.
   * @param m
   */
  setMonth(m: number): void {
    this.#date = this.#date.set({ month: m + 1 });
  }

  /**
   * Sets the hour.
   * @param h
   */
  setHours(h: number): void {
    this.#date = this.#date.set({ hour: h });
  }

  /**
   * Sets the minutes.
   * @param m
   */
  setMinutes(m: number): void {
    this.#date = this.#date.set({ minute: m });
  }

  /**
   * Sets the seconds.
   * @param s
   */
  setSeconds(s: number): void {
    this.#date = this.#date.set({ second: s });
  }

  /**
   * Sets the milliseconds.
   * @param s
   */
  setMilliseconds(s: number): void {
    this.#date = this.#date.set({ millisecond: s });
  }

  /**
   * Returns the date as a string.
   * @returns {string}
   */
  toString(): string {
    return this.toDate().toString();
  }

  /**
   * Returns the date as a Date object.
   * @returns {Date}
   */
  toDate(): Date {
    return this.#date.toJSDate();
  }

  /**
   * Returns true if the day is the last day of the month.
   * @returns {boolean}
   */
  isLastDayOfMonth(): boolean {
    const month = this.#date.month;
    const day = this.#date.day;

    // Special handling for February in leap years
    if (month === 2) {
      const isLeap = CronDate.#isLeapYear(this.#date.year);
      return day === (isLeap ? 29 : 28);
    }

    // For other months, check against the static map
    return day === DAYS_IN_MONTH[month - 1];
  }

  /**
   * Returns true if the day is the last weekday of the month.
   * @returns {boolean}
   */
  isLastWeekdayOfMonth(): boolean {
    const month = this.#date.month;
    const day = this.#date.day;

    // Get the last day of the current month
    let lastDay: number;
    if (month === 2) {
      // Special handling for February
      lastDay = CronDate.#isLeapYear(this.#date.year) ? 29 : 28;
    } else {
      lastDay = DAYS_IN_MONTH[month - 1];
    }

    // Check if the current day is within 7 days of the end of the month
    return day > lastDay - 7;
  }

  /**
   * Primarily for internal use.
   * @param {DateMathOp} op - The operation to perform.
   * @param {TimeUnit} unit - The unit of time to use.
   * @param {number} [hoursLength] - The length of the hours. Required when unit is not month or day.
   */
  applyDateOperation(op: DateMathOp, unit: TimeUnit, hoursLength?: number): void {
    if (unit === TimeUnit.Month || unit === TimeUnit.Day) {
      this.invokeDateOperation(op, unit);
      return;
    }

    const previousHour = this.getHours();
    this.invokeDateOperation(op, unit);
    const currentHour = this.getHours();
    const diff = currentHour - previousHour;
    if (diff === 2) {
      if (hoursLength !== 24) {
        this.dstStart = currentHour;
      }
    } else if (diff === 0 && this.getMinutes() === 0 && this.getSeconds() === 0) {
      if (hoursLength !== 24) {
        this.dstEnd = currentHour;
      }
    }
  }

  /**
   * Returns the UTC date.
   * @private
   * @returns {DateTime}
   */
  #getUTC(): DateTime {
    return this.#date.toUTC();
  }
}

export default CronDate;
