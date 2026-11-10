const split = (value: string, separator: string) =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

/** The trimmed, non-empty parts of `value`, once each when `unique`. */
export function toSeparatedArray(value: string, separator: string, unique = false): string[] {
  if (!value || !separator) return [];
  const parts = split(value, separator);
  return unique ? [...new Set(parts)] : parts;
}

/** The items joined by `separator`, once each when `unique`. */
export function toSeparatedString(value: (string | number)[], separator: string, unique = false): string {
  if (!value || !separator) return '';
  return (unique ? [...new Set(value)] : value).join(separator);
}

/** `value` with its parts trimmed, empty ones dropped, and rejoined by `separator`. */
export function toSeparatedList(value: string, separator: string, unique = false): string {
  return toSeparatedString(toSeparatedArray(value, separator, unique), separator);
}

/**
 * Up to `max` initials of a name, upper-cased: the first and the last word's, so `'Ada King Lovelace'` is `'AL'`.
 * Words split at spaces and hyphens; one with no letter or digit, like `'—'`, is skipped. `''` when none is left.
 */
export function getInitials(name: string | null | undefined, max = 2): string {
  if (!name || max < 1) return '';
  const firsts = name
    .split(/[\s-]+/u)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0])
    .filter((letter): letter is string => !!letter);
  const picked = firsts.length <= max ? firsts : [...firsts.slice(0, max - 1), firsts[firsts.length - 1]];
  return picked.join('').toLocaleUpperCase();
}

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** `length` letters and digits, from the platform's random source. */
export function getRandomString(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

/** @deprecated Use {@link getRandomString} instead. */
export const generateRandomString = getRandomString;
