"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compactField = void 0;
function compactField(input) {
    if (input.length === 0) {
        return [];
    }
    const output = [];
    let current = { start: input[0], count: 1 };
    input.slice(1).forEach((item, i, arr) => {
        const prevItem = arr[i - 1] || current.start;
        const nextItem = arr[i + 1];
        if (current.step === undefined && nextItem !== undefined) {
            const step = item - prevItem;
            const nextStep = nextItem - item;
            if (step <= nextStep) {
                current = { ...current, count: 2, end: item, step };
                return;
            }
            current.step = 1;
        }
        if (item - (current.end ?? 0) === current.step) {
            current.count++;
            current.end = item;
        }
        else {
            if (current.count === 1) {
                output.push({ start: current.start, count: 1 });
            }
            else if (current.count === 2) {
                output.push({ start: current.start, count: 1 });
                output.push({ start: current.end ?? prevItem, count: 1 }); // it is impossible for current.end to be undefined, this makes typescript happy
            }
            else {
                output.push(current);
            }
            current = { start: item, count: 1 };
        }
    });
    output.push(current);
    return output;
}
exports.compactField = compactField;
