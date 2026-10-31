/** A number rounded to `precision` decimals, as a number: `toFixedNumber(1.005, 2)` is `1`, not `'1.00'`. */
export function toFixedNumber(value: number, precision = 2): number {
  return Number(Number(value).toFixed(precision));
}

/**
 * The sum of a list: of each item, or of each item's `key`. Anything that isn't
 * a number is read as one, and a missing value counts as 0.
 */
export function calcTotal<T>(data: T[], key?: keyof T): number {
  return data.reduce((total, item) => {
    const value = key && typeof item === 'object' && item !== null ? item[key] : item;
    return total + Number(value ?? 0);
  }, 0);
}

/** The mean of a list, as {@link calcTotal} reads it; 0 for an empty one. */
export function calcAvg<T>(data: T[], key?: keyof T): number {
  return data.length === 0 ? 0 : calcTotal(data, key) / data.length;
}

/** `a` as a percentage of `b`, to two decimals. */
export function calcPercentage(a: number, b: number): number {
  return toFixedNumber((a / b) * 100);
}

/** How far `b` moved from `a`, in percent, to two decimals; 100 when `a` is 0 or less. */
export function calcDiffPercentage(a: number, b: number): number {
  return a > 0 ? -toFixedNumber(((a - b) / a) * 100) : 100;
}
