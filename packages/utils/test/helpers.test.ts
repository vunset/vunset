import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  calcAvg,
  calcDiffPercentage,
  calcPercentage,
  calcTotal,
  debounce,
  escapeCsvValue,
  formatCsv,
  formatPercentage,
  getRandomString,
  toFixedNumber,
  toSeparatedArray,
  toSeparatedList,
  toSeparatedString
} from '../src';

describe('toFixedNumber', () => {
  it('rounds to a number, two decimals unless told', () => {
    expect(toFixedNumber(3.14159)).toBe(3.14);
    expect(toFixedNumber(3.14159, 0)).toBe(3);
  });
});

describe('calcTotal and calcAvg', () => {
  const rows = [{ qps: 2 }, { qps: '3' }, { qps: null }, {}] as { qps?: number | string | null }[];

  it('sums a key, reading strings as numbers and a missing value as 0', () => {
    expect(calcTotal(rows, 'qps')).toBe(5);
  });

  it('sums the items themselves without a key', () => {
    expect(calcTotal([1, '2', null, 4])).toBe(7);
  });

  it('averages the same way, and gives 0 for an empty list', () => {
    expect(calcAvg(rows, 'qps')).toBe(1.25);
    expect(calcAvg([])).toBe(0);
  });
});

describe('percentages', () => {
  it('gives a share in percent, to two decimals', () => {
    expect(calcPercentage(1, 3)).toBe(33.33);
  });

  it('gives a change in percent, and 100 from nothing', () => {
    expect(calcDiffPercentage(200, 250)).toBe(25);
    expect(calcDiffPercentage(200, 150)).toBe(-25);
    expect(calcDiffPercentage(0, 5)).toBe(100);
  });

  it('formats a fraction with one decimal, or the digits it is given', () => {
    expect(formatPercentage(0.125)).toBe('12.5%');
    // Not merged with the default minimum, which would be above this maximum.
    expect(formatPercentage(0.125, { maximumFractionDigits: 0 })).toBe('13%');
    expect(formatPercentage(null)).toBe('N/A');
    expect(formatPercentage(0.5, { locale: 'de-DE' })).toMatch(/^50,0\s%$/);
  });
});

describe('toSeparatedArray and toSeparatedString', () => {
  it('splits, trims and drops empty parts', () => {
    expect(toSeparatedArray(' a, b,,a ', ',')).toEqual(['a', 'b', 'a']);
    expect(toSeparatedArray(' a, b,,a ', ',', true)).toEqual(['a', 'b']);
    expect(toSeparatedArray('', ',')).toEqual([]);
  });

  it('joins, once each when unique, and gives a string for nothing', () => {
    expect(toSeparatedString(['a', 1, 'a'], ', ')).toBe('a, 1, a');
    expect(toSeparatedString(['a', 1, 'a'], ', ', true)).toBe('a, 1');
    expect(toSeparatedString([], ',')).toBe('');
  });
});

describe('toSeparatedList', () => {
  it('trims the parts, drops empty ones and rejoins them', () => {
    expect(toSeparatedList(' a, b,,a ', ',')).toBe('a,b,a');
    expect(toSeparatedList(' a, b,,a ', ',', true)).toBe('a,b');
    expect(toSeparatedList('a\n\n b\n', '\n')).toBe('a\nb');
    expect(toSeparatedList('', ',')).toBe('');
  });
});

describe('getRandomString', () => {
  it('is letters and digits, twenty unless told', () => {
    expect(getRandomString()).toMatch(/^[0-9a-zA-Z]{20}$/);
    expect(getRandomString(8)).toHaveLength(8);
    expect(getRandomString()).not.toBe(getRandomString());
  });
});

describe('debounce', () => {
  afterEach(() => vi.useRealTimers());

  it('runs once, after the last call of a burst, with its arguments', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    vi.advanceTimersByTime(50);
    debounced('b');
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('b');
  });
});

describe('CSV', () => {
  it('quotes a cell only when it has to', () => {
    expect(escapeCsvValue('plain')).toBe('plain');
    expect(escapeCsvValue('a, b')).toBe('"a, b"');
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvValue('two\nlines')).toBe('"two\nlines"');
    expect(escapeCsvValue(null)).toBe('');
    expect(escapeCsvValue(0)).toBe('0');
  });

  it('writes the headers, then each row’s values in order', async () => {
    const blob = formatCsv(['name', 'qps'], [{ name: 'EU, west', qps: 3 }, ['US', 5]]);
    expect(blob.type).toBe('text/csv;charset=utf-8;');
    expect(await blob.text()).toBe('name,qps\n"EU, west",3\nUS,5');
  });
});
