import { ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import { scrollIntoViewWithin } from './focus';

export type Orientation = 'horizontal' | 'vertical';

export interface UseRovingFocusOptions {
  /** The element containing the items. */
  container: Ref<HTMLElement | null>;
  /** Selector matching the navigable items. */
  itemSelector?: MaybeRefOrGetter<string>;
  /** Which arrow keys move between items. */
  orientation?: MaybeRefOrGetter<Orientation>;
  /** Wrap around at the ends. */
  loop?: MaybeRefOrGetter<boolean>;
  /** Called when navigation runs past the start or end without looping. */
  onEscapeBoundary?: (direction: 'start' | 'end') => void;
  /**
   * Track the active item without moving DOM focus, for
   * `aria-activedescendant`.
   *
   * A listbox with a search box needs this: focus has to stay in the text input
   * so typing keeps working, while the highlight travels down the options.
   */
  virtual?: MaybeRefOrGetter<boolean>;
  /** Called with the element that became active, in virtual mode. */
  onActiveChange?: (item: HTMLElement | null) => void;
}

/**
 * Arrow-key navigation over a set of items.
 *
 * Items are discovered by querying the DOM at interaction time rather than by
 * registering themselves. That keeps them in document order for free, which
 * registration-based approaches get wrong as soon as items are reordered,
 * conditionally rendered or wrapped in a `v-for` that changes.
 *
 * Disabled items are skipped, matching how a native menu behaves.
 */
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

  /**
   * Makes `item` the active one, by focus or by reference depending on the mode.
   *
   * The virtual branch scrolls it into view itself: focusing an element does
   * that for free, so nothing else in the library has had to.
   *
   * `scroll` exists for the pointer. Revealing an item the user is already
   * pointing at is at best redundant and at worst a loop: the scroll moves the
   * list under a stationary cursor, which puts a different half-clipped item
   * under it, which scrolls again. Only the keyboard, which can move the
   * highlight somewhere off screen, actually needs the reveal.
   */
  function setActive(item: HTMLElement | null, scroll = true) {
    if (virtual()) {
      activeItem.value = item;
      options.onActiveChange?.(item);
    } else {
      // Never scrolls: the surface may not be positioned yet, and revealing an
      // item that still sits at the document origin jumps the page to the top.
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
