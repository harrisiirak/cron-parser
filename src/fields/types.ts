export type RangeFrom<LENGTH extends number, ACC extends unknown[] = []> = ACC['length'] extends LENGTH
  ? ACC
  : RangeFrom<LENGTH, [...ACC, 1]>;
export type IntRange<FROM extends number[], TO extends number, ACC extends number = never> = FROM['length'] extends TO
  ? ACC | TO
  : IntRange<[...FROM, 1], TO, ACC | FROM['length']>;

export type SixtyRange = IntRange<RangeFrom<0>, 59>; // 0-59 - inclusive
export type HourRange = IntRange<RangeFrom<0>, 23>; // 0-23 - inclusive
export type DayOfMonthRange = IntRange<RangeFrom<1>, 31> | 'L'; // 1-31 - inclusive
export type MonthRange = IntRange<RangeFrom<1>, 12>; // 1-12 - inclusive
export type DayOfWeekRange = IntRange<RangeFrom<0>, 7>; // 0-7 - inclusive
export type CronFieldType = SixtyRange[] | HourRange[] | DayOfMonthRange[] | MonthRange[] | DayOfWeekRange[];
export type CronChars = 'L' | 'W';
export type CronMin = 0 | 1;
export type CronMax = 7 | 12 | 23 | 31 | 59;
export type ParseRangeResponse = number[] | string[] | number | string;

export type CronConstraints = {
  min: CronMin;
  max: CronMax;
  chars: readonly CronChars[];
  validChars: RegExp;
};
