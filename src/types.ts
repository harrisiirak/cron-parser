import {CronDate, CronExpression} from './';
import {CronSecond} from './fields/CronSecond';
import {CronMinute} from './fields/CronMinute';
import {CronHour} from './fields/CronHour';
import {CronDayOfMonth} from './fields/CronDayOfMonth';
import {CronMonth} from './fields/CronMonth';
import {CronDayOfTheWeek} from './fields/CronDayOfTheWeek';


// TS >= 4.5 tail recursion optimization
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export type SixtyRange = IntRange<0, 60>; // 0-59 - non-inclusive
export type HourRange = IntRange<0, 24>; // 0-23 - non-inclusive
export type DayOfTheMonthRange = IntRange<1, 32> | 'L'; // 1-31 - non-inclusive
export type MonthRange = IntRange<1, 13>; // 1-12 - non-inclusive
export type DayOfTheWeekRange = IntRange<0, 8>; // 0-7 - non-inclusive
export type CronFieldTypes = SixtyRange[] | HourRange[] | DayOfTheMonthRange[] | MonthRange[] | DayOfTheWeekRange[];
export type CronChars = 'L' | 'W';
export type CronMin = 0 | 1;
export type CronMax = 7 | 12 | 23 | 31 | 59;

export interface IFieldConstraint {
  min: CronMin;
  max: CronMax;
  chars: CronChars[];
}

export interface IFieldConstraints {
  second: IFieldConstraint,
  minute: IFieldConstraint,
  hour: IFieldConstraint,
  dayOfMonth: IFieldConstraint,
  month: IFieldConstraint,
  dayOfWeek: IFieldConstraint,
}

export enum MonthsEnum {jan = 1, feb = 2, mar = 3, apr = 4, may = 5, jun = 6, jul = 7, aug = 8, sep = 9, oct = 10, nov = 11, dec = 12}

export enum DaysInMonthEnum {jan = 31, feb = 29, mar = 31, apr = 30, may = 31, jun = 30, jul = 31, aug = 31, sep = 30, oct = 31, nov = 30, dec = 31}

export enum DayOfWeekEnum {sun = 0, mon = 1, tue = 2, wed = 3, thu = 4, fri = 5, sat = 6}


export enum TimeUnitsEnum {second = 'second', minute = 'minute', hour = 'hour', day = 'day', month = 'month', year = 'year'}

export enum DateMathOpEnum {add = 'add', subtract = 'subtract'}

export enum PredefinedCronExpressionsEnum {
  '@yearly' = '0 0 1 1 *',
  '@monthly' = '0 0 1 * *',
  '@weekly' = '0 0 * * 0',
  '@daily' = '0 0 * * *',
  '@hourly' = '0 * * * *'
}

export interface ICronExpressionParserOptions {
  currentDate?: Date | string | number | CronDate; // FIXME: Should date be one of the types?
  endDate?: Date | string | number | CronDate;
  startDate?: Date | string | number | CronDate;
  iterator?: boolean;
  utc?: boolean;
  tz?: string;
  nthDayOfWeek?: number;
}

export interface ICronParserOptions {
  currentDate?: Date | string | number | CronDate; // FIXME: Should date be one of the types?
  endDate?: Date | string | number | CronDate;
  startDate?: Date | string | number | CronDate;
  iterator?: boolean;
  utc?: boolean;
  tz?: string;
  nthDayOfWeek?: number;
  expression?: string;
  strict?: boolean;
}


export interface IRange {
  start: number;
  count: number;
  end?: number;
  step?: number;
}

export interface ICronFieldsParams {
  second: SixtyRange[] | CronSecond;
  minute: SixtyRange[] | CronMinute;
  hour: HourRange[] | CronHour;
  dayOfMonth: DayOfTheMonthRange[] | CronDayOfMonth;
  month: MonthRange[] | CronMonth;
  dayOfWeek: DayOfTheWeekRange[] | CronDayOfTheWeek;
}

export type ParseStringResponse = { variables: { [key: string]: number | string }, expressions: CronExpression[], errors: { [key: string]: unknown } }

export interface IIteratorFields {
  value: CronDate;
  done: boolean;
}

export type IIteratorCallback = (item: IIteratorFields | CronDate, index: number) => void;



