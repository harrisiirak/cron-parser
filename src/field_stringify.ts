import { compactField, Range } from './field_compactor';
import assert from 'assert';
import {CronFieldTypes} from "./CronFields";

function handleSingleRange(range: Range, min: number, max: number): string | null {
    const step = range.step;
    if (step === 1 && range.start === min && range.end === max) return '*';
    if (!step) return null;
    if (step !== 1 && range.start === min && range.end === max - step + 1) return `*/${step}`;
    return null;
}

function handleMultipleRanges(range: Range, max: number): string {
    const step = range.step;
    if (step === 1) return `${range.start}-${range.end}`;

    const multiplier = range.start === 0 ? range.count - 1 : range.count;
    assert(step, 'Unexpected range step');
    assert(range.end, 'Unexpected range end');
    if (step * multiplier > range.end) {
        const values = Array.from({ length: range.end - range.start + 1 }, (_, index) => {
            const value = range.start + index;
            return (value - range.start) % step === 0 ? value : null;
        }).filter(value => value !== null);
        return values.join(',');
    }

    return range.end === max - step + 1 ? `${range.start}/${step}` : `${range.start}-${range.end}/${step}`;
}

function stringifyField(arr: CronFieldTypes, min: number, max: number): string {
    // FIXME: arr as unknown as number[]
    const ranges = compactField(arr as unknown as number[]);

    if (ranges.length === 1) {
        const singleRangeResult = handleSingleRange(ranges[0], min, max);
        if (singleRangeResult) return singleRangeResult;
    }

    return ranges.map(range => range.count === 1 ? range.start.toString() : handleMultipleRanges(range, max)).join(',');
}

export { stringifyField };
