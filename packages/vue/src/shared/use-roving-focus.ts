import { ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import { scrollIntoViewWithin } from './focus';

export type Orientation = 'horizontal' | 'vertical';

export interface UseRovingFocusOptions {
  container: Ref<HTMLElement | null>;
  itemSelector?: MaybeRefOrGetter<string>;
  orientation?: MaybeRefOrGetter<Orientation>;
  loop?: MaybeRefOrGetter<boolean>;
  /** Called when navigation runs past the start or end without looping. */
  onEscapeBoundary?: (direction: 'start' | 'end') => void;
  /** Track the active item without moving focus, for `aria-activedescendant`: a search box keeps focus while the highlight moves. */
  virtual?: MaybeRefOrGetter<boolean>;
  onActiveChange?: (item: HTMLElement | null) => void;
}

// Items are queried from the DOM at interaction time, so they stay in document order however they render.
export function useRovingFocus(options: UseRovingFocusOptions) {
  const selector = () => toValue(options.itemSelector) ?? '[role="menuitem"]';
  const orientation = () => toValue(options.orientation) ?? 'vertical';
  const loop = () => toValue(options.loop) ?? true;
  const virtual = () => toValue(options.virtual) ?? false;

  /** The active item in virtual mode. Unused when real focus does the job. */
  const activeItem = ref<HTMLElement | null>(null);

  function items(): HTMLElement[] {
    const container = options.container.value;
    if (!container) {
      return [];
    }
    return Array.from(container.querySelectorAll<HTMLElement>(selector())).filter(
      (el) => el.getAttribute('aria-disabled') !== 'true' && !el.hasAttribute('disabled'),
    );
  }

  function focusAt(index: number) {
    const list = items();
    if (list.length === 0) {
      return;
    }

    let next = index;
    if (next < 0) {
      if (!loop()) {
        options.onEscapeBoundary?.('start');
        return;
      }
      next = list.length - 1;
    } else if (next >= list.length) {
      if (!loop()) {
        options.onEscapeBoundary?.('end');
        return;
      }
      next = 0;
    }

    setActive(list[next] ?? null);
  }

  // `scroll` is off for the pointer: revealing a hovered item moves the list under the cursor, and loops.
  function setActive(item: HTMLElement | null, scroll = true) {
    if (virtual()) {
      activeItem.value = item;
      options.onActiveChange?.(item);
    } else {
      // Never scrolls: an unpositioned surface still sits at the origin, and revealing it jumps the page to the top.
      item?.focus({ preventScroll: true });
    }

    if (item && scroll) {
      scrollIntoViewWithin(item, options.container.value);
    }
  }

  function currentIndex(): number {
    const current = virtual() ? activeItem.value : (document.activeElement as HTMLElement | null);
    return current ? items().indexOf(current) : -1;
  }

  function move(delta: number) {
    focusAt(currentIndex() + delta);
  }

  function onKeydown(event: KeyboardEvent): boolean {
    const vertical = orientation() === 'vertical';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        move(1);
        return true;
      case prevKey:
        event.preventDefault();
        move(-1);
        return true;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        return true;
      case 'End':
        event.preventDefault();
        focusAt(items().length - 1);
        return true;
      default:
        return false;
    }
  }

  return { items, focusAt, move, onKeydown, currentIndex, setActive, activeItem };
}
