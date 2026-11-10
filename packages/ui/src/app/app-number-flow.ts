/** One character of a value laid out to animate: `key` stays the same for the same place across values. */
export interface FlowPart {
  key: string;
  char: string;
  /** `0`–`9` for a digit that can roll to another; `null` for anything else. */
  digit: number | null;
}

export interface FlowPartsOptions extends Intl.NumberFormatOptions {
  /** @default 'en-US' */
  locale?: Intl.LocalesArgument;
}

const asDigit = (char: string) => (char >= '0' && char <= '9' ? Number(char) : null);

/**
 * The whole number's characters keyed from the decimal point outwards, so a digit keeps its place
 * as the value grows or shrinks: units are `i0`, tens `i1`, the first decimal `f0`. A grouping
 * separator is keyed by the digits to its right. Characters outside the number are keyed by
 * their side and position, with the character, so a changed one enters anew.
 */
function keyNumber(integer: string[], decimal: string | null, fraction: string[], before: string[], after: string[]): FlowPart[] {
  const parts: FlowPart[] = before.map((char, index) => ({ key: `p${index}:${char}`, char, digit: null }));
  let digits = 0;
  const whole: FlowPart[] = [];
  for (let index = integer.length - 1; index >= 0; index--) {
    const char = integer[index];
    const digit = asDigit(char);
    whole.unshift(digit === null ? { key: `g${digits}:${char}`, char, digit } : { key: `i${digits++}`, char, digit });
  }
  parts.push(...whole);
  if (decimal !== null) parts.push({ key: `d:${decimal}`, char: decimal, digit: null });
  fraction.forEach((char, index) => {
    const digit = asDigit(char);
    parts.push({ key: digit === null ? `f${index}:${char}` : `f${index}`, char, digit });
  });
  after.forEach((char, index) => parts.push({ key: `s${index}:${char}`, char, digit: null }));
  return parts;
}

/**
 * A value split into the characters an animation moves, each keyed by its place, so the same
 * place in the next value is matched to it: a digit there can roll rather than enter. A number is
 * formatted with `locale` and the `Intl.NumberFormat` options, which say exactly where its decimal
 * point is. Text is matched from its digits: the last `.` or `,` among them is its decimal point
 * unless it reads as a grouping separator. Text with no digit is keyed by position and character.
 */
export function toFlowParts(value: number | string, options: FlowPartsOptions = {}): FlowPart[] {
  if (typeof value === 'number') {
    const { locale = 'en-US', ...intl } = options;
    if (!Number.isFinite(value)) return toFlowParts(String(value));
    const integer: string[] = [];
    const fraction: string[] = [];
    const before: string[] = [];
    const after: string[] = [];
    let decimal: string | null = null;
    let reached = false;
    for (const part of new Intl.NumberFormat(locale, intl).formatToParts(value)) {
      const chars = Array.from(part.value);
      if (part.type === 'integer' || part.type === 'group') {
        integer.push(...chars);
        reached = true;
      } else if (part.type === 'decimal') decimal = part.value;
      else if (part.type === 'fraction') fraction.push(...chars);
      else (reached ? after : before).push(...chars);
    }
    return keyNumber(integer, decimal, fraction, before, after);
  }

  const chars = Array.from(value);
  const first = chars.findIndex((char) => asDigit(char) !== null);
  if (first === -1) return chars.map((char, index) => ({ key: `t${index}:${char}`, char, digit: null }));
  let last = chars.length - 1;
  while (asDigit(chars[last]) === null) last--;

  const core = chars.slice(first, last + 1);
  const separators = core.map((char, index) => (char === '.' || char === ',' ? index : -1)).filter((index) => index >= 0);
  const point = separators.at(-1);
  let decimalAt = -1;
  if (point !== undefined) {
    const mark = core[point];
    const others = separators.slice(0, -1).map((index) => core[index]);
    const digitsAfter = core.slice(point + 1).filter((char) => asDigit(char) !== null).length;
    // `1,234.5` and `1.234,5`: a different mark before it. `12.5`: not three digits after it.
    if (others.some((other) => other !== mark) || (others.length === 0 && digitsAfter !== 3)) decimalAt = point;
  }

  return keyNumber(
    decimalAt === -1 ? core : core.slice(0, decimalAt),
    decimalAt === -1 ? null : core[decimalAt],
    decimalAt === -1 ? [] : core.slice(decimalAt + 1),
    chars.slice(0, first),
    chars.slice(last + 1)
  );
}
