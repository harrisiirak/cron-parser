import { CronDate, CronExpression } from './';
import { CronSecond } from './fields/CronSecond.js';
import { CronMinute } from './fields/CronMinute.js';
import { CronHour } from './fields/CronHour.js';
import { CronDayOfMonth } from './fields/CronDayOfMonth.js';
import { CronMonth } from './fields/CronMonth.js';
import { CronDayOfTheWeek } from './fields/CronDayOfTheWeek.js';

// TS >= 4.5 tail recursion optimization
// https://dev.to/tylim88/typescript-numeric-range-type-15a5
export type RangeFrom<LENGTH extends number, ACC extends unknown[] = []> = ACC['length'] extends LENGTH ? ACC : RangeFrom<LENGTH, [...ACC, 1]>;
export type IntRange<FROM extends number[], TO extends number, ACC extends number = never> = FROM['length'] extends TO
  ? ACC | TO
  : IntRange<[...FROM, 1], TO, ACC | FROM['length']>;

export type SixtyRange = IntRange<RangeFrom<0>, 59>; // 0-59 - inclusive
export type HourRange = IntRange<RangeFrom<0>, 23>; // 0-23 - inclusive
export type DayOfTheMonthRange = IntRange<RangeFrom<1>, 31> | 'L'; // 1-31 - inclusive
export type MonthRange = IntRange<RangeFrom<1>, 12>; // 1-12 - inclusive
export type DayOfTheWeekRange = IntRange<RangeFrom<0>, 7>; // 0-7 - inclusive
export type CronFieldTypes = SixtyRange[] | HourRange[] | DayOfTheMonthRange[] | MonthRange[] | DayOfTheWeekRange[];
export type CronChars = 'L' | 'W';
export type CronMin = 0 | 1;
export type CronMax = 7 | 12 | 23 | 31 | 59;
export type ParseRageResponse = number[] | string[] | number | string;

export type SerializedCronField = {
  wildcard: boolean;
  values: (number | string)[];
};

export type CronConstraints = {
  min: CronMin;
  max: CronMax;
  chars: CronChars[];
  validChars: RegExp;
}

export type SerializedCronFields = {
  second: SerializedCronField;
  minute: SerializedCronField;
  hour: SerializedCronField;
  dayOfMonth: SerializedCronField;
  month: SerializedCronField;
  dayOfWeek: SerializedCronField;
};

export type RawCronFields = {
  second: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

// these need to be lowercase for the parser to work
export enum Months {
  jan = 1,
  feb = 2,
  mar = 3,
  apr = 4,
  may = 5,
  jun = 6,
  jul = 7,
  aug = 8,
  sep = 9,
  oct = 10,
  nov = 11,
  dec = 12,
}

// these need to be lowercase for the parser to work
export enum DayOfWeek {
  sun = 0,
  mon = 1,
  tue = 2,
  wed = 3,
  thu = 4,
  fri = 5,
  sat = 6,
}

// TODO TypeScript enum's are weird when you have the same number value for multiple keys which is why we have to do this as strings
//   Really don't like this and would like to find a better way to do this
export enum DaysInMonth {
  Jan = '31',
  Feb = '29',
  Mar = '31',
  Apr = '30',
  May = '31',
  Jun = '30',
  Jul = '31',
  Aug = '31',
  Sep = '30',
  Oct = '31',
  Nov = '30',
  Dec = '31',
}

export enum CronUnits {
  Second = 'Second',
  Minute = 'Minute',
  Hour = 'Hour',
  DayOfMonth = 'DayOfMonth',
  Month = 'Month',
  DayOfWeek = 'DayOfWeek',
}

export enum TimeUnits {
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

export enum PredefinedExpressions {
  '@yearly' = '0 0 0 1 1 *',
  '@annually' = '0 0 0 1 1 *',
  '@monthly' = '0 0 0 1 * *',
  '@weekly' = '0 0 0 * * 0',
  '@daily' = '0 0 0 * * *',
  '@hourly' = '0 0 * * * *',
  '@minutely' = '0 * * * * *',
  '@secondly' = '* * * * * *',
  '@weekdays' = '0 0 0 * * 1-5',
  '@weekends' = '0 0 0 * * 0,6',
}

export interface ICronExpression {
  expression?: string;
  currentDate?: Date | string | number | CronDate;
  endDate?: Date | string | number | CronDate;
  startDate?: Date | string | number | CronDate;
  iterator?: boolean;
  utc?: boolean;
  tz?: string;
  nthDayOfWeek?: number;
}

export interface ICronParseOptions {
  currentDate?: Date | string | number | CronDate;
  endDate?: Date | string | number | CronDate;
  startDate?: Date | string | number | CronDate;
  iterator?: boolean;
  utc?: boolean;
  tz?: string;
  nthDayOfWeek?: number;
  expression?: string;
  strict?: boolean;
}

export interface IFieldConstraints {
  second: CronConstraints;
  minute: CronConstraints;
  hour: CronConstraints;
  dayOfMonth: CronConstraints;
  month: CronConstraints;
  dayOfWeek: CronConstraints;
}

export interface ICronFields {
  second: SixtyRange[] | CronSecond;
  minute: SixtyRange[] | CronMinute;
  hour: HourRange[] | CronHour;
  dayOfMonth: DayOfTheMonthRange[] | CronDayOfMonth;
  month: MonthRange[] | CronMonth;
  dayOfWeek: DayOfTheWeekRange[] | CronDayOfTheWeek;
}

export interface IFieldRange {
  start: number | CronChars;
  count: number;
  end?: number;
  step?: number;
}

export type ParseStringResponse = {
  variables: { [key: string]: number | string };
  expressions: CronExpression[];
  errors: { [key: string]: unknown };
};

export interface IIteratorFields {
  value: CronDate;
  done: boolean;
}

export type IIteratorCallback = (item: IIteratorFields | CronDate, index: number) => void;
