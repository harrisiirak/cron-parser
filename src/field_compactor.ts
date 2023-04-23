import assert from 'assert';

interface Range {
    start: number;
    count: number;
    end?: number;
    step?: number;
}

/**
 * Creates a new range object with the specified start value.
 * @param {number} item - The start value of the range.
 * @returns {Range} - A new Range object.
 */
const buildRange = (item: number): Range => ({ start: item, count: 1 });

/**
 * Completes the range object with the specified end value and calculates the step.
 * @param {Range} range - The range object to update.
 * @param {number} item - The end value of the range.
 */
function completeRangeWithItem(range: Range, item: number): void {
    range.end = item;
    range.step = item - range.start;
    range.count = 2;
}

/**
 * Finalizes the current range and appends it to the results array.
 * @param {Range[]} results - The results array to append the current range to.
 * @param {Range | undefined} currentRange - The current range object to finalize.
 * @param {Range | undefined} currentItemRange - An optional range object to append after finalizing the current range.
 */
function finalizeCurrentRange(results: Range[], currentRange: Range | undefined, currentItemRange?: Range): void {
    if (currentRange) {
        // Two elements do not form a range so split them into 2 single elements
        if (currentRange.count === 2) {
            results.push(buildRange(currentRange.start));
            assert(currentRange.end, 'Unexpected range end');
            results.push(buildRange(currentRange.end));
        } else {
            results.push(currentRange);
        }
    }
    if (currentItemRange) {
        results.push(currentItemRange);
    }
}

/**
 * Updates the current range based on the new item.
 * @param {Range[]} results - The results array to append the current range to.
 * @param {Range} currentRange - The current range object to update.
 * @param {number} currentItem - The new item to process.
 * @returns {Range | undefined} - Returns the updated range object, or undefined if the range is finalized.
 */
function updateRange(results: Range[], currentRange: Range, currentItem: number): Range | undefined {
    assert(currentRange.end, 'Unexpected range end');
    if (currentRange.step === currentItem - currentRange.end) {
        // We found another item that matches the current range
        currentRange.count++;
        currentRange.end = currentItem;
        return currentRange;
    } else if (currentRange.count === 2) {
        // Break the first item of the current range into a single element, and try to start a new range with the second item
        results.push(buildRange(currentRange.start));
        currentRange = buildRange(currentRange.end);
        completeRangeWithItem(currentRange, currentItem);
        return currentRange;
    } else {
        // Persist the current range and start a new one with current item
        finalizeCurrentRange(results, currentRange);
        return buildRange(currentItem);
    }
}

/**
 * Compacts the input array of numbers into a minimal set of ranges.
 * @param {number[]} arr - The input array of numbers.
 * @returns {Range[]} - An array of compacted ranges.
 */
function compactField(arr: number[]): Range[] {
    const results: Range[] = [];
    let currentRange: Range | undefined;

    for (const currentItem of arr) {
        if (!currentRange) {
            // Start a new range
            currentRange = buildRange(currentItem);
        } else
        if (currentRange.count === 1) {
            // Guess that the current item starts a range
            completeRangeWithItem(currentRange, currentItem);
        } else {
            currentRange = updateRange(results, currentRange, currentItem);
        }
    }

    finalizeCurrentRange(results, currentRange);

    return results;
}
export { compactField, Range };
