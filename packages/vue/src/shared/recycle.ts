import { inject, provide, watch, type InjectionKey } from 'vue';

// A virtual table's row element is handed the next row's data in place of its own, so state a
// part keeps for the old item (an open popover, a mounted `Deferred`) must not carry over.
const recycleKey: InjectionKey<() => unknown> = Symbol('recycle');

/** Marks everything below as drawn for `item`, which may change in place. */
export function provideRecycle(item: () => unknown): void {
  provide(recycleKey, item);
}

/** Runs `reset` whenever the item this part is drawn for changes in place. */
export function onRecycle(reset: () => void): void {
  const item = inject(recycleKey, null);
  if (item) watch(item, reset);
}
