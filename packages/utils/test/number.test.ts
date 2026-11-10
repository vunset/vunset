import { describe, it, expect, vi } from 'vitest';
import { formatNumber, formatCurrency, chartColors, parseNumber, toPlainNumber } from '../src';

describe('formatNumber', () => {
  it('formats a number, and a numeric string', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5');
    expect(formatNumber('1234.5')).toBe('1,234.5');
  });

  it('returns the fallback for anything that is not a reading', () => {
    // `Number(null)` and `Number('')` are both 0, which would report a value
    // that was never there.
    expect(formatNumber(null)).toBe('N/A');
    expect(formatNumber(undefined)).toBe('N/A');
    expect(formatNumber('')).toBe('N/A');
    expect(formatNumber('not a number')).toBe('N/A');
    expect(formatNumber(Number.NaN)).toBe('N/A');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('N/A');
    expect(formatNumber(null, { fallback: '—' })).toBe('—');
  });

  it('keeps a real zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('takes a currency as the only option it needs', () => {
    expect(formatNumber(12, { currency: 'EUR' })).toBe('€12.00');
  });

  it('passes the rest of Intl through', () => {
    expect(formatNumber(0.427, { style: 'percent', maximumFractionDigits: 1 })).toBe('42.7%');
    expect(formatNumber(1234, { notation: 'compact' })).toBe('1.2K');
  });

  it('defaults a currency to dollars, and takes another', () => {
    expect(formatCurrency(12)).toBe('$12.00');
    expect(formatCurrency(12, { currency: 'GBP' })).toBe('£12.00');
    expect(formatCurrency(null)).toBe('N/A');
  });

  it('builds one formatter per locale and options, however many numbers it formats', () => {
    const build = vi.spyOn(Intl, 'NumberFormat');

    for (let i = 0; i < 50; i += 1) formatNumber(i, { maximumFractionDigits: 3, minimumFractionDigits: 3 });
    expect(build).toHaveBeenCalledTimes(1);

    // Different options or locale are a formatter of their own, not the one before.
    expect(formatNumber(1.5, { maximumFractionDigits: 0 })).toBe('2');
    expect(formatNumber(1234.5, { locale: 'de-DE' })).toBe('1.234,5');
    expect(build).toHaveBeenCalledTimes(3);
    build.mockRestore();
  });
});

describe('chartColors', () => {
  it('hands back custom properties rather than literals', () => {
    expect(chartColors(3)).toEqual([
      'var(--chart-color-0, currentColor)',
      'var(--chart-color-1, currentColor)',
      'var(--chart-color-2, currentColor)',
    ]);
  });

  it('takes a prefix of its own', () => {
    expect(chartColors(2, '--brand-')).toEqual(['var(--brand-0, currentColor)', 'var(--brand-1, currentColor)']);
  });

  it('falls back past the palette to the text color, or to what it is given', () => {
    expect(chartColors(1, '--brand-', '#888')).toEqual(['var(--brand-0, #888)']);
  });
});

describe('parseNumber', () => {
  it('reads what formatNumber writes, in any locale and format', () => {
    expect(parseNumber('1,234.5', { locale: 'en-US' })).toBe(1234.5);
    expect(parseNumber('1.234.567,8', { locale: 'de-DE' })).toBe(1234567.8);
    expect(parseNumber('1 234,5', { locale: 'fr-FR' })).toBe(1234.5);
    expect(parseNumber("1'234.5", { locale: 'de-CH' })).toBe(1234.5);
    expect(parseNumber('$1,234.50', { locale: 'en-US', style: 'currency', currency: 'USD' })).toBe(1234.5);
    expect(parseNumber('12 kg', { locale: 'en-US', style: 'unit', unit: 'kilogram' })).toBe(12);
    expect(parseNumber('12%', { locale: 'en-US', style: 'percent' })).toBe(0.12);
  });

  it('takes a typographic minus, and the point only where it is not a grouping separator', () => {
    expect(parseNumber('\u22125', { locale: 'en-US' })).toBe(-5);
    expect(parseNumber('1.5', { locale: 'fr-FR' })).toBe(1.5);
    expect(parseNumber('1.5', { locale: 'de-DE' })).toBe(15);
  });

  it('gives null for nothing and NaN for what is not a number', () => {
    expect(parseNumber('', { locale: 'en-US' })).toBeNull();
    expect(parseNumber('  ')).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber('abc', { locale: 'en-US' })).toBeNaN();
    expect(parseNumber('-', { locale: 'en-US' })).toBeNaN();
  });
});

describe('toPlainNumber', () => {
  it('keeps a half-typed number and refuses a stray character', () => {
    expect(toPlainNumber('-', { locale: 'en-US' })).toBe('-');
    expect(toPlainNumber('1.', { locale: 'en-US' })).toBe('1.');
    expect(toPlainNumber('1,5', { locale: 'de-DE' })).toBe('1.5');
    expect(toPlainNumber('1a', { locale: 'en-US' })).toBeNull();
  });
});
