import { onScopeDispose } from 'vue';

export interface UseTypeaheadOptions<T = HTMLElement> {
  /** The items to search, re-read on each keystroke so the list can change. */
  items: () => T[];
  /** Text to match against. Defaults to the item's trimmed text content. */
  getText?: (item: T) => string;
  /** How long keystrokes accumulate before the buffer resets. */
  resetMs?: number;
  /** The item the search should start after. */
  getActive?: () => T | null;
  /** What to do with a match. Defaults to focusing it. */
  onMatch?: (item: T) => void;
}

/**
 * Type-to-focus over a list of items, the way a native `<select>` behaves.
 */
export function useTypeahead<T = HTMLElement>(options: UseTypeaheadOptions<T>) {
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | undefined;

  const getText = options.getText ?? ((item: T) => (item as HTMLElement).textContent?.trim() ?? '');

  function reset() {
    buffer = '';
    timer = undefined;
  }

  function onKeydown(event: KeyboardEvent): boolean {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return false;
    if (event.key === ' ' && buffer === '') return false;

    event.preventDefault();

    clearTimeout(timer);
    timer = setTimeout(reset, options.resetMs ?? 500);

    buffer += event.key.toLowerCase();

    const list = options.items();
    if (list.length === 0) return true;

    const allSame = buffer.length > 1 && buffer.split('').every((c) => c === buffer[0]);
    const query = allSame ? buffer[0] : buffer;

    const active = options.getActive ? options.getActive() : (document.activeElement as T | null);
    const activeIndex = active ? list.indexOf(active) : -1;
    const start = allSame || buffer.length === 1 ? activeIndex + 1 : activeIndex;

    for (let i = 0; i < list.length; i += 1) {
      const item = list[(Math.max(start, 0) + i) % list.length];

      if (getText(item).toLowerCase().startsWith(query)) {
        if (options.onMatch) {
          options.onMatch(item);
        } else {
          (item as HTMLElement).focus({ preventScroll: true });
        }
        break;
      }
    }

    return true;
  }

  onScopeDispose(() => clearTimeout(timer));

  return { onKeydown, reset };
}
