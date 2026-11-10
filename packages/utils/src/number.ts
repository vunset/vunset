export type NumberInput = number | string | null | undefined;

export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  /** Returned for a missing or unreadable number. @default 'N/A' */
  fallback?: string;
  /** @default 'en-US' */
  locale?: Intl.LocalesArgument;
}

// Building a formatter costs ~60× formatting with one: a table formats every cell it draws.
const formatters = new Map<string, Intl.NumberFormat>();

function formatter(locale: Intl.LocalesArgument, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify([String(locale), options]);
  let found = formatters.get(key);
  if (!found) {
    found = new Intl.NumberFormat(locale, options);
    formatters.set(key, found);
  }
  return found;
}

export function formatNumber(value: NumberInput, options: FormatNumberOptions = {}): string {
  const { fallback = 'N/A', locale = 'en-US', ...intl } = options;

  if (value === null || value === undefined || value === '') return fallback;

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return formatter(locale, {
    ...(intl.currency ? { style: 'currency' as const } : null),
    ...intl
  }).format(parsed);
}

/** {@link formatNumber} in a currency, US dollars unless told otherwise. */
export function formatCurrency(value: NumberInput, options: FormatNumberOptions = {}): string {
  return formatNumber(value, { style: 'currency', currency: 'USD', ...options });
}

/**
 * {@link formatNumber} as a percentage, of a fraction: `0.125` is `12.5%`. One
 * decimal unless given number options of its own.
 */
export function formatPercentage(value: NumberInput, options: FormatNumberOptions = {}): string {
  const { fallback, locale, ...intl } = options;
  // Not merged: a `maximumFractionDigits` below the default minimum would throw.
  const digits = Object.keys(intl).length > 0 ? intl : { minimumFractionDigits: 1, maximumFractionDigits: 1 };
  return formatNumber(value, { fallback, locale, style: 'percent', ...digits });
}

export interface ParseNumberOptions extends Intl.NumberFormatOptions {
  /** The runtime's own when left out. */
  locale?: Intl.LocalesArgument;
}

interface NumberSymbols {
  group: string;
  decimal: string;
  minus: string;
  /** Currency, percent and unit signs, and the format's literal text: read past. */
  skipped: string[];
  percent: boolean;
}

const symbolCache = new Map<string, NumberSymbols>();

function symbolsOf(options: ParseNumberOptions): NumberSymbols {
  const { locale, ...intl } = options;
  const key = JSON.stringify([String(locale), intl]);
  let found = symbolCache.get(key);
  if (!found) {
    const parts = new Intl.NumberFormat(locale, intl).formatToParts(-12345.6);
    const of = (type: string) => parts.find((part) => part.type === type)?.value;
    found = {
      group: of('group') ?? '',
      decimal: of('decimal') ?? '.',
      minus: of('minusSign') ?? '-',
      skipped: parts
        .filter((part) => ['currency', 'percentSign', 'unit', 'literal', 'compact'].includes(part.type))
        .map((part) => part.value.trim())
        .filter(Boolean),
      percent: intl.style === 'percent'
    };
    symbolCache.set(key, found);
  }
  return found;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * `text` written the way it would be in a format and locale, as plain digits with `.` and `-`:
 * `'1.234,5'` in German is `'1234.5'`. `null` when it holds a character no number there could.
 * A half-typed number (`'-'`, `'1.'`) stays as it is.
 */
export function toPlainNumber(text: string, options: ParseNumberOptions = {}): string | null {
  const { group, decimal, minus, skipped } = symbolsOf(options);
  let plain = text.replace(/[\s  ]/g, '');
  for (const symbol of skipped) plain = plain.replaceAll(symbol, '');
  // A grouping separator that is a space is gone already; any other is read past.
  if (group.trim()) plain = plain.replace(new RegExp(escape(group.trim()), 'g'), '');
  if (decimal !== '.') plain = plain.replaceAll(decimal, '.');
  plain = plain.replaceAll(minus, '-').replaceAll('−', '-');
  return /^-?\d*(?:\.\d*)?$/.test(plain) ? plain : null;
}

/**
 * The number `text` reads as in a format and locale, so whatever `formatNumber` writes reads
 * back: `'$1,234.50'` is `1234.5`, `'12%'` is `0.12`. `null` for empty text, `NaN` for text that
 * isn't a number.
 */
export function parseNumber(text: string | null | undefined, options: ParseNumberOptions = {}): number | null {
  if (text == null || text.trim() === '') return null;
  const plain = toPlainNumber(text, options);
  if (plain === null || !/\d/.test(plain)) return NaN;
  const value = Number(plain);
  return symbolsOf(options).percent ? value / 100 : value;
}
