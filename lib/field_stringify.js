"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyField = void 0;
const field_compactor_1 = require("./field_compactor");
const assert_1 = __importDefault(require("assert"));
function handleSingleRange(range, min, max) {
    const step = range.step;
    if (step === 1 && range.start === min && range.end === max)
        return '*';
    if (!step)
        return null;
    if (step !== 1 && range.start === min && range.end === max - step + 1)
        return `*/${step}`;
    return null;
}
function handleMultipleRanges(range, max) {
    const step = range.step;
    if (step === 1)
        return `${range.start}-${range.end}`;
    const multiplier = range.start === 0 ? range.count - 1 : range.count;
    (0, assert_1.default)(step, 'Unexpected range step');
    (0, assert_1.default)(range.end, 'Unexpected range end');
    if (step * multiplier > range.end) {
        const values = Array.from({ length: range.end - range.start + 1 }, (_, index) => {
            const value = range.start + index;
            return (value - range.start) % step === 0 ? value : null;
        }).filter(value => value !== null);
        return values.join(',');
    }
    return range.end === max - step + 1 ? `${range.start}/${step}` : `${range.start}-${range.end}/${step}`;
}
function stringifyField(arr, min, max) {
    // FIXME: arr as unknown as number[]
    const ranges = (0, field_compactor_1.compactField)(arr);
    if (ranges.length === 1) {
        const singleRangeResult = handleSingleRange(ranges[0], min, max);
        if (singleRangeResult)
            return singleRangeResult;
    }
    return ranges.map(range => range.count === 1 ? range.start.toString() : handleMultipleRanges(range, max)).join(',');
}
exports.stringifyField = stringifyField;
