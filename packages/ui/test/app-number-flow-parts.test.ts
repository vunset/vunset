import { describe, it, expect } from 'vitest';
import { toFlowParts } from '../src/app/app-number-flow';

describe('toFlowParts', () => {
  const keys = (value: number | string, options = {}) => toFlowParts(value, options).map((part) => part.key);

  it('keys a number from its decimal point outwards', () => {
    expect(keys(1234.5, { maximumFractionDigits: 2 })).toEqual(['i3', 'g3:,', 'i2', 'i1', 'i0', 'd:.', 'f0']);
    expect(keys(999)).toEqual(['i2', 'i1', 'i0']);
    expect(keys(1000)).toEqual(['i3', 'g3:,', 'i2', 'i1', 'i0']);
  });

  it('keeps a symbol by its side, and gives a digit its value', () => {
    const parts = toFlowParts(12.5, { style: 'currency', currency: 'USD' });
    expect(parts.map((part) => part.key)).toEqual(['p0:$', 'i1', 'i0', 'd:.', 'f0', 'f1']);
    expect(parts.map((part) => part.digit)).toEqual([null, 1, 2, null, 5, 0]);
    expect(keys(0.25, { style: 'percent' })).toEqual(['i1', 'i0', 's0:%']);
  });

  it('follows the locale', () => {
    expect(keys(1234.5, { locale: 'de-DE', minimumFractionDigits: 1 })).toEqual(['i3', 'g3:.', 'i2', 'i1', 'i0', 'd:,', 'f0']);
  });

  it('finds the decimal point in text', () => {
    expect(keys('$1,234.56')).toEqual(['p0:$', 'i3', 'g3:,', 'i2', 'i1', 'i0', 'd:.', 'f0', 'f1']);
    expect(keys('1.234,5 €')).toEqual(['i3', 'g3:.', 'i2', 'i1', 'i0', 'd:,', 'f0', 's0: ', 's1:€']);
    expect(keys('12.5')).toEqual(['i1', 'i0', 'd:.', 'f0']);
    // Three digits after a lone mark read as thousands.
    expect(keys('1,234')).toEqual(['i3', 'g3:,', 'i2', 'i1', 'i0']);
  });

  it('keys text around its digits, and text without any by position', () => {
    expect(keys('3 files')).toEqual(['i0', 's0: ', 's1:f', 's2:i', 's3:l', 's4:e', 's5:s']);
    expect(keys('Hi')).toEqual(['t0:H', 't1:i']);
    expect(toFlowParts('Hi').every((part) => part.digit === null)).toBe(true);
  });

  it('writes a non-finite number as text', () => {
    expect(toFlowParts(Infinity).map((part) => part.char).join('')).toBe('Infinity');
  });
});
