/**
 * Finds the next (or previous, when reverse=true) value in a sorted numeric list.
 * Returns null if there's no value strictly after/before the current one.
 */
export function getNextValue(values: number[], current: number, reverse: boolean): number | null {
  if (reverse) {
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] < current) return values[i];
    }
    return null;
  }

  for (let i = 0; i < values.length; i++) {
    if (values[i] > current) return values[i];
  }
  return null;
}
