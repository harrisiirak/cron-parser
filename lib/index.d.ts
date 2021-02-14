declare class CronDate {
  addYear(): void
  addMonth(): void
  addDay(): void
  addHour(): void
  addMinute(): void
  addSecond(): void

  subtractYear(): void
  subtractMonth(): void
  subtractDay(): void
  subtractHour(): void
  subtractMinute(): void
  subtractSecond(): void

  getDate(): number
  getFullYear(): number
  getDay(): number
  getMonth(): number
  getHours(): number
  getMinutes(): number
  getSeconds(): number
  getMilliseconds(): number
  getTime(): number
  getUTCDate(): number
  getUTCFullYear(): number
  getUTCDay(): number
  getUTCMonth(): number
  getUTCHours(): number
  getUTCMinutes(): number
  getUTCSeconds(): number

  toISOString(): string
  toJSON(): string

  setDate(d: number): void
  setFullYear(y: number): void
  setDay(d: number): void
  setMonth(m: number): void
  setHours(h: number): void
  setMinutes(m: number): void
  setSeconds(s: number): void
  setMilliseconds(s: number): void

  getTime(): number
  toString(): string
  toDate(): Date
}

interface ParserOptions {
  currentDate?: string | number | Date
  startDate?: string | number | Date
  endDate?: string | number | Date
  iterator?: boolean
  utc?: boolean
  tz?: string
}

declare class CronExpression {
  constructor(fields: {}, options: {})

  /** Find next suitable date */
  next(): CronDate
  /** Find previous suitable date */
  prev(): CronDate

  /** Check if next suitable date exists */
  hasNext(): boolean
  /** Check if previous suitable date exists */
  hasPrev(): boolean

  /** Iterate over expression iterator */
  iterate(steps: number, callback?: (item: CronDate, i: number) => any): CronDate[]

  /** Reset expression iterator state */
  reset(resetDate?: string | number | Date): void

  /** Parse input expression (async) */
  parse(expression: string, options?: ParserOptions, callback?: () => any): CronExpression
}

export interface StringResult {
  variables: { [key: string]: string },
  expressions: CronExpression[],
  errors: { [key: string]: any },
}

/** Wrapper for CronExpression.parse method */
export const parseExpression: typeof CronExpression.parse;

/** Parse crontab file */
export function parseFile(filePath: string, callback: (err: any, data: StringResult) => void): void;

/** Parse content string */
export function parseString(data: string): StringResult;
