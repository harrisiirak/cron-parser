import {CronDate} from './date';

type BuildRangeTuple<Current extends [...number[]], Count extends number> = Current['length'] extends Count ? Current : BuildRangeTuple<[number, ...Current], Count>
type RangeTuple<Count extends number> = BuildRangeTuple<[], Count>
type BuildRange<Current extends number, End extends number, Accu extends [...number[]]> = Accu['length'] extends End ? Current : BuildRange<Current | Accu['length'], End, [number, ...Accu]>
type FieldRange<StartInclusive extends number, EndExclusive extends number> = BuildRange<StartInclusive, EndExclusive, RangeTuple<StartInclusive>>

export type SixtyRange = FieldRange<0, 30> | FieldRange<30, 60>; // Typescript restriction on recursion depth
export type HourRange = FieldRange<0, 24>;
export type DayOfTheMonthRange = FieldRange<1, 32> | 'L';
export type MonthRange = FieldRange<1, 13>;
export type DayOfTheWeekRange = FieldRange<0, 8>;

export interface FieldConstraints {
    min: number;
    max: number;
    chars: string[];
}

export enum MonthsEnum {jan = 1, feb = 2, mar = 3, apr = 4, may = 5, jun = 6, jul = 7, aug = 8, sep = 9, oct = 10, nov = 11, dec = 12}

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

export type CronAliasesType = { [key: string]: MonthsEnum | DayOfWeekEnum };

export interface CronExpressionParserOptions {
    currentDate?: Date | string | number | CronDate; // FIXME: Should date be one of the types?
    endDate?: Date | string | number;
    startDate?: Date | string | number;
    iterator?: boolean;
    utc?: boolean;
    tz?: string;
    nthDayOfWeek?: number;
}

export type CronFieldTypes = SixtyRange[] | HourRange[] | DayOfTheMonthRange[] | MonthRange[] | DayOfTheWeekRange[];

export interface Range {
    start: number;
    count: number;
    end?: number;
    step?: number;
}

export interface CronFieldsParams {
    second: SixtyRange[];
    minute: SixtyRange[];
    hour: HourRange[];
    dayOfMonth: DayOfTheMonthRange[];
    month: MonthRange[];
    dayOfWeek: DayOfTheWeekRange[];
}

// *********************************************************************************************************************

export interface CronParserOptions {
    currentDate?: Date | string | number | CronDate; // FIXME: Should date be one of the types?
    endDate?: Date | string | number;
    startDate?: Date | string | number;
    iterator?: boolean;
    utc?: boolean;
    tz?: string;
    nthDayOfWeek?: number;
}

interface CronConstraints {
    min: number;
    max: number;
    chars: string[];

}

export interface MappedFields {
    second: SixtyRange[];
    minute: SixtyRange[];
    hour: HourRange[];
    dayOfMonth: DayOfTheMonthRange[];
    month: MonthRange[];
    dayOfWeek: DayOfTheWeekRange[];
}

export interface IteratorFields {
    value: CronDate;
    done: boolean;
}

export type IteratorResult = Iterator<IteratorFields>;
export type IteratorCallback = (item: IteratorFields | CronDate, index: number) => void;

type KeyValueType = { [key: string]: number };
type MonthsType = { [key: string]: MonthsEnum };
type DayOfWeekType = { [key: string]: DayOfWeekEnum };
type AliasesType = {
    month: MonthsType;
    dayOfWeek: DayOfWeekType;
};


enum DayOfWeek {sun = 0, mon = 1, tue = 2, wed = 3, thu = 4, fri = 5, sat = 6}
