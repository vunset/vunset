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

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** `length` letters and digits, from the platform's random source. */
export function getRandomString(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

/** @deprecated Use {@link getRandomString} instead. */
export const generateRandomString = getRandomString;
