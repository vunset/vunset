/**
 * Per-key overrides for how state becomes attributes. Return `null` to omit.
 *
 * @example
 * { checked: (on) => (on ? { 'data-checked': '' } : { 'data-unchecked': '' }) }
 */
export type DataAttrsMapping<State> = {
  [K in keyof State]?: (value: State[K]) => Record<string, string | undefined> | null;
};

type Attr = [name: string, value: string | undefined];

/** Turns a state object into the `data-*` attributes used as styling hooks. */
export function dataAttrs<State extends Record<string, any>>(
  state: State,
  mapping: DataAttrsMapping<State> = {}
): Record<string, string> {
  const attrs = Object.keys(state).flatMap((key): Attr[] => {
    const value = state[key];
    const custom = Object.hasOwn(mapping, key) ? mapping[key as keyof State] : undefined;

    if (custom) return Object.entries(custom(value) ?? {});
    // A flag is present or absent; anything else falsy is absent too.
    if (!value) return [];
    return [[`data-${key.toLowerCase()}`, value === true ? '' : String(value)]];
  });

  return Object.fromEntries(attrs.filter((attr): attr is [string, string] => attr[1] !== undefined));
}
