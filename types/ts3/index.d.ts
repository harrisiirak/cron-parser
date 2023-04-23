import {CronDate, DateType, ICronExpression, IStringResult, ParserOptions} from '../common';

export type CronFieldsType = {
    readonly second: readonly number[];
    readonly minute: readonly number[];
    readonly hour: readonly number[];
    readonly dayOfMonth: readonly (number | 'L')[];
    readonly month: readonly number[];
    readonly dayOfWeek: readonly number[];
}

export {ParserOptions, CronDate, DateType};
export type CronExpression<IsIterable extends boolean = false> = ICronExpression<CronFieldsType, IsIterable>
export type StringResult = IStringResult<CronFieldsType>

export function parseExpression<IsIterable extends boolean = false>(expression: string, options?: ParserOptions<IsIterable>): CronExpression<IsIterable>;

export function fieldsToExpression<IsIterable extends boolean = false>(fields: CronFieldsType, options?: ParserOptions<IsIterable>): CronExpression<IsIterable>;

export function parseFile(filePath: string, callback: (err: any, data: StringResult) => any): void;

export function parseString(data: string): StringResult;
