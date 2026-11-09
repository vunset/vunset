import { computed, toRaw } from 'vue';
import { isListboxGroup, type ListboxItem } from '@vunset/vue';

type Key = string | number;
type Entry = Record<string, unknown>;

/** The field an option is keyed by inside the part, when `value-key` isn't set. */
export const OBJECT_KEY = '__key';

// Stable per object, so a re-render keeps each option's key. Raw, so a reactive model matches its option.
const ids = new WeakMap<object, Key>();
let nextId = 0;

function idOf(object: object): Key {
  const entry = toRaw(object);
  let id = ids.get(entry);
  if (id === undefined) {
    id = `o${nextId++}`;
    ids.set(entry, id);
  }
  return id;
}

const isEntry = (value: unknown): value is Entry => typeof value === 'object' && value !== null;

export interface ObjectModelSource {
  /** Whether `v-model.object` is on. */
  enabled: () => boolean;
  valueKey: () => string | undefined;
  labelKey: () => string | undefined;
  /** Every option, out of their groups. */
  options: () => unknown[];
  model: () => unknown;
}

/**
 * `v-model.object`: the app's model holds whole options while the part works on keys. With `value-key`, an
 * object matches the option whose field equals its own; without, only the option itself matches.
 */
export function useObjectModel(source: ObjectModelSource) {
  const byIdentity = () => source.enabled() && source.valueKey() === undefined;

  const keyOf = (entry: unknown): Key | undefined => {
    if (!isEntry(entry)) return entry as Key | undefined;
    const valueKey = source.valueKey();
    return valueKey === undefined ? idOf(entry) : (entry[valueKey] as Key);
  };

  // Created in a combobox without `value-key`: keyed by its text, since no option holds it.
  const coined = new WeakSet<object>();

  // Each key to what the app gets back: an option first, else an object from the model (one not loaded yet).
  const known = computed(() => {
    const map = new Map<Key, unknown>();
    if (!source.enabled()) return map;
    const model = source.model();
    for (const entry of Array.isArray(model) ? model : [model]) {
      if (isEntry(entry) && (!byIdentity() || coined.has(toRaw(entry)))) map.set(keyOf(entry)!, toRaw(entry));
    }
    for (const option of source.options()) map.set(keyOf(option)!, isEntry(option) ? toRaw(option) : option);
    return map;
  });

  const toKey = (entry: unknown) => {
    const key = keyOf(entry);
    return byIdentity() && isEntry(entry) && !known.value.has(key!) ? undefined : key;
  };

  /** The model as the part takes it. */
  function toKeys(value: unknown): unknown {
    if (!source.enabled() || value == null) return value;
    if (Array.isArray(value)) return value.map(toKey).filter((key) => key !== undefined);
    return toKey(value) ?? null;
  }

  const fromKey = (key: Key) => {
    const found = known.value.get(key);
    if (found !== undefined) return found;
    const entry: Entry = { [source.valueKey() ?? 'value']: key, [source.labelKey() ?? 'label']: key };
    if (source.valueKey() === undefined) {
      ids.set(entry, key);
      coined.add(entry);
    }
    return entry;
  };

  /** The part's value as the app's model gets it. */
  function fromKeys(value: unknown): unknown {
    if (!source.enabled() || value == null) return value;
    return Array.isArray(value) ? value.map(fromKey) : fromKey(value as Key);
  }

  /** An option as the part renders it: keyed under `OBJECT_KEY` when matched by identity. */
  const withKey = <T>(option: T): T =>
    byIdentity() && isEntry(option) ? ({ ...option, [OBJECT_KEY]: idOf(option) } as T) : option;

  /** The `value-key` the part reads. */
  const partValueKey = () => (byIdentity() ? OBJECT_KEY : source.valueKey());

  /** A listbox's options, groups and all, each through `withKey`. */
  const withKeys = (items: ListboxItem[] | undefined) =>
    !byIdentity() || !items
      ? items
      : items.map((item) => (isListboxGroup(item) ? { ...item, options: item.options.map(withKey) } : withKey(item)));

  return { toKeys, fromKeys, keyOf, withKeys, partValueKey };
}

/** A listbox's options out of their groups. */
export const listboxOptions = (items: ListboxItem[] | undefined) =>
  (items ?? []).flatMap((item) => (isListboxGroup(item) ? item.options : [item]));
