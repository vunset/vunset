/** What may be typed: a regex source (anchored, applied to every intermediate value), a RegExp, or a predicate over the prospective and current values. */
export type FieldFilter =
  | string
  | RegExp
  | ((next: string, previous: string) => boolean);

const compiled = new Map<string, RegExp | null>();

/** A predicate over the prospective value, or `null` for a source that won't compile, so a typo doesn't block every keystroke. */
export function toFilterPredicate(
  filter: FieldFilter,
): ((next: string, previous: string) => boolean) | null {
  if (typeof filter === 'function') {
    return filter;
  }

  if (typeof filter === 'string') {
    if (!compiled.has(filter)) {
      try {
        compiled.set(filter, new RegExp(`^(?:${filter})$`));
      } catch {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[useField] The filter ${JSON.stringify(filter)} is not a valid regular expression, so nothing is being filtered.`);
        }
        compiled.set(filter, null);
      }
    }
    const expression = compiled.get(filter)!;
    return expression && ((next: string) => expression.test(next));
  }

  // `lastIndex` persists on a global or sticky regex, so `test` would alternate; a flagless copy can't.
  const expression =
    filter.global || filter.sticky
      ? new RegExp(filter.source, filter.flags.replace(/[gy]/g, ''))
      : filter;

  return (next: string) => expression.test(next);
}

/** The text an insertion is about to add, or `null` when it cannot be read. */
export function insertedText(event: InputEvent): string | null {
  if (event.data != null) {
    return event.data;
  }
  // Pasting and dropping carry their payload here instead.
  return event.dataTransfer?.getData('text/plain') ?? null;
}

/** The value after the insertion, or `null` where the element exposes no selection (`number`, `email`, `date`). */
export function prospectiveValue(
  element: HTMLInputElement,
  inserted: string,
): string | null {
  const start = element.selectionStart;
  const end = element.selectionEnd;

  if (start === null || end === null) {
    return null;
  }

  return element.value.slice(0, start) + inserted + element.value.slice(end);
}

/** Digits, an optional leading sign and at most one decimal point. */
export const NUMERIC = /^-?\d*(?:\.\d*)?$/;

/** The same without the sign, for a control whose `min` rules negatives out. */
export const NON_NEGATIVE_NUMERIC = /^\d*(?:\.\d*)?$/;

const bound = (raw: number | string | undefined) => {
  const number = raw === undefined || raw === '' ? NaN : Number(raw);
  return Number.isFinite(number) ? number : undefined;
};

/** Whether a typed number breaks `min`, `max` or `step` as a native number input would. A half-typed `-` or `.` passes. */
export function outOfRange(
  value: string,
  limits: { min?: number | string; max?: number | string; step?: number | string },
): boolean {
  const number = value.trim() === '' ? NaN : Number(value);
  if (!Number.isFinite(number)) return false;

  const min = bound(limits.min);
  const max = bound(limits.max);
  if ((min !== undefined && number < min) || (max !== undefined && number > max)) return true;

  // `step="any"` reads as no step; the steps count from `min`, or from zero.
  const step = bound(limits.step);
  if (step === undefined || step <= 0) return false;
  const steps = (number - (min ?? 0)) / step;
  return Math.abs(steps - Math.round(steps)) > 1e-9;
}
