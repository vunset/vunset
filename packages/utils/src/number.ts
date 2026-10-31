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
