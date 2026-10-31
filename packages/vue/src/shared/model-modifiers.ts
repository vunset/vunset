/** `v-model.optional` writes `undefined` once the value is emptied: `''`, `[]` or `null`. */
export interface ModelModifiers {
  optional?: boolean;
}

/** A text input's: `.trim` and `.number` as on an `<input>`, which Vue applies to the emitted value. */
export interface InputModelModifiers extends ModelModifiers {
  trim?: boolean;
  number?: boolean;
}

/** The value as `v-model` receives it under `modifiers`. */
export function applyModelModifiers<T>(value: T, modifiers?: InputModelModifiers): T | undefined {
  if (!modifiers?.optional) return value;
  // Trimmed first, so `.trim.optional` writes `undefined` for blank text too.
  const text = modifiers.trim && typeof value === 'string' ? value.trim() : value;
  const empty = text === null || text === '' || (Array.isArray(text) && text.length === 0);
  return empty ? undefined : value;
}
