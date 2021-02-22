import {expectType} from 'tsd';
import * as CronExpression from '../lib';

const interval = CronExpression.parseExpression('0 1 2 3 * 1-3,5');

expectType<readonly number[]>(interval.fields.second);
expectType<readonly number[]>(interval.fields.minute);
expectType<readonly number[]>(interval.fields.hour);
expectType<readonly number[]>(interval.fields.dayOfMonth);
expectType<readonly number[]>(interval.fields.month);
expectType<readonly number[]>(interval.fields.dayOfWeek);
