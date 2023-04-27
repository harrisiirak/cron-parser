import {CronDate, CronExpression} from './';

// TS >= 4.5 tail recursion optimization
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export type SixtyRange = IntRange<0, 60>;
export type HourRange = IntRange<0, 24>;
export type DayOfTheMonthRange = IntRange<1, 32> | 'L';
export type MonthRange = IntRange<1, 13>;
export type DayOfTheWeekRange = IntRange<0, 8>;
export type CronFieldTypes = SixtyRange[] | HourRange[] | DayOfTheMonthRange[] | MonthRange[] | DayOfTheWeekRange[];
export interface IFieldConstraint {
  min: number;
  max: number;
  chars: string[];
}

export type IFieldConstraints = {
  second: IFieldConstraint,
  minute: IFieldConstraint,
  hour: IFieldConstraint,
  dayOfMonth: IFieldConstraint,
  month: IFieldConstraint,
  dayOfWeek: IFieldConstraint,
}

export type CronConstraints = {
  second: { min: number, max: number, chars: string[] },
  minute: { min: number, max: number, chars: string[] },
  hour: { min: number, max: number, chars: string[] },
  dayOfMonth: { min: number, max: number, chars: string[] },
  month: { min: number, max: number, chars: string[] },
  dayOfWeek: { min: number, max: number, chars: string[] },
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
}



export interface IRange {
  start: number;
  count: number;
  end?: number;
  step?: number;
}

export interface ICronFieldsParams {
  second: SixtyRange[];
  minute: SixtyRange[];
  hour: HourRange[];
  dayOfMonth: DayOfTheMonthRange[];
  month: MonthRange[];
  dayOfWeek: DayOfTheWeekRange[];
}

export type ParseStringResponse = { variables: { [key: string]: number | string }, expressions: CronExpression[], errors: { [key: string]: unknown } }

export interface IIteratorFields {
  value: CronDate;
  done: boolean;
}

export type IIteratorCallback = (item: IIteratorFields | CronDate, index: number) => void;



