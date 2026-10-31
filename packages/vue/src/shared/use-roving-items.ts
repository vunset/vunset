import { computed, ref, shallowRef, type ComputedRef, type Ref } from 'vue';

/** One navigable item's entry in the set its container keeps. */
export interface RovingItem<Value> {
  value: Value;
  /** Stable for the item's lifetime; what a re-registration is matched on. */
  id: string;
  disabled: boolean;
  element: HTMLElement | null;
}

export interface UseRovingItemsOptions<Value> {
  /**
   * Which item should hold the tab stop before focus has moved into the set —
   * usually the selected one. A set with no selection leaves it undefined and
   * the first enabled item takes it.
   */
  preferred?: () => Value | undefined;
}

export interface UseRovingItemsReturn<Value> {
  /** Registration order. Shallow, so elements come back unproxied. */
  items: Ref<RovingItem<Value>[]>;
  /** The same items in document order. */
  ordered: ComputedRef<RovingItem<Value>[]>;
  register: (item: RovingItem<Value>) => void;
  unregister: (id: string) => void;
  find: (value: Value) => RovingItem<Value> | undefined;
  /** The item focus last landed on, which is not always the preferred one. */
  highlighted: Ref<Value | undefined>;
  highlight: (value: Value | undefined) => void;
  /** The single item the Tab key reaches. */
  tabbableValue: ComputedRef<Value | undefined>;
}

/**
 * The set of items behind a roving tab stop: who is in it, in what order, and
 * which one the Tab key reaches.
 *
 * The companion to {@link useRovingFocus}, which moves focus *between* items by
 * querying the DOM at interaction time. That covers the keys, but not the
 * `tabindex` each item has to render with — a value known before any key is
 * pressed, and reactive — so anything with a roving tab stop keeps this
 * alongside it.
 *
 * The tab stop follows focus rather than selection, so leaving a set and
 * returning to it lands on the item last looked at. It falls back to the first
 * enabled item when the preferred one is disabled or absent, because otherwise
 * every item renders `-1` and the whole set drops out of the tab order.
 */
export function useRovingItems<Value>(
  options: UseRovingItemsOptions<Value> = {},
): UseRovingItemsReturn<Value> {
  /**
   * Shallow on purpose: a deep ref would hand back proxied DOM elements, and an
   * element compared against `document.activeElement` — or measured — has to be
   * the element itself. Every change replaces the array instead.
   */
  const items = shallowRef<RovingItem<Value>[]>([]);

  /** Registration order is mount order; items are read in document order. */
  const ordered = computed(() =>
    [...items.value].sort((a, b) => {
      if (!a.element || !b.element || a.element === b.element) {
        return 0;
      }
      return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;
    }),
  );

  function register(item: RovingItem<Value>): void {
    const index = items.value.findIndex((entry) => entry.id === item.id);
    const next = [...items.value];
    if (index === -1) {
      next.push(item);
    } else {
      next[index] = item;
    }
    items.value = next;
  }

  function unregister(id: string): void {
    items.value = items.value.filter((entry) => entry.id !== id);
  }

  function find(value: Value): RovingItem<Value> | undefined {
    return ordered.value.find((entry) => entry.value === value);
  }

  const highlighted = ref<Value | undefined>(undefined) as Ref<Value | undefined>;

  function highlight(value: Value | undefined): void {
    highlighted.value = value;
  }

  const tabbableValue = computed(() => {
    const list = ordered.value;
    const preferred = highlighted.value ?? options.preferred?.();
    if (preferred !== undefined && list.some((item) => item.value === preferred && !item.disabled)) {
      return preferred;
    }
    return list.find((item) => !item.disabled)?.value;
  });

  return { items, ordered, register, unregister, find, highlighted, highlight, tabbableValue };
}
