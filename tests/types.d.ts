import { expectAssignable, expectNotAssignable } from 'tsd';
import { DayOfMonthRange, DayOfWeekRange, HourRange, MonthRange, SixtyRange } from '../src';
import { Months } from '../src/CronExpressionParser';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
expectAssignable<number>(5);

// Assert that SixtyRange includes 0 and 59
expectAssignable<SixtyRange>(0);
expectAssignable<SixtyRange>(59);

// Assert that SixtyRange does not include -1 and 60
expectNotAssignable<SixtyRange>(-1);
expectNotAssignable<SixtyRange>(60);

// Assert that SixtyRange does not include 0.5 and 58.5
expectNotAssignable<SixtyRange>(0.5);
expectNotAssignable<SixtyRange>(58.5);

// Assert that HourRange includes 0 and 23
expectAssignable<HourRange>(0);
expectAssignable<HourRange>(23);

// Assert that HourRange does not include -1 and 24
expectNotAssignable<HourRange>(-1);
expectNotAssignable<HourRange>(24);

// Assert that HourRange does not include 0.5 and 22.5
expectNotAssignable<HourRange>(0.5);
expectNotAssignable<HourRange>(22.5);

// Assert that DayOfMonthRange includes 1, 31, and 'L'
expectAssignable<DayOfMonthRange>(1);
expectAssignable<DayOfMonthRange>(31);
expectAssignable<DayOfMonthRange>('L');

// Assert that DayOfMonthRange does not include 0 and 32
expectNotAssignable<DayOfMonthRange>(0);
expectNotAssignable<DayOfMonthRange>(32);

// Assert that DayOfMonthRange does not include 0.5 and 30.5
expectNotAssignable<DayOfMonthRange>(0.5);
expectNotAssignable<DayOfMonthRange>(30.5);

// Assert that DayOfMonthRange does not include 'l'
expectNotAssignable<DayOfMonthRange>('l');

// Assert that MonthRange includes 1 and 12
expectAssignable<MonthRange>(1);
expectAssignable<MonthRange>(12);

// Assert that MonthRange does not include 0 and 13
expectNotAssignable<MonthRange>(0);
expectNotAssignable<MonthRange>(13);

// Assert that MonthRange does not include 0.5 and 11.5
expectNotAssignable<MonthRange>(0.5);
expectNotAssignable<MonthRange>(11.5);

// Assert that DayOfWeekRange includes 0 and 7
expectAssignable<DayOfWeekRange>(0);
expectAssignable<DayOfWeekRange>(7);

// Assert that DayOfWeekRange does not include -1 and 8
expectNotAssignable<DayOfWeekRange>(-1);
expectNotAssignable<DayOfWeekRange>(8);

// Assert that DayOfWeekRange does not include 0.5 and 6.5
expectNotAssignable<DayOfWeekRange>(0.5);
expectNotAssignable<DayOfWeekRange>(6.5);

// Assert the MonthsEnum
expectAssignable<keyof typeof Months>('jan');
