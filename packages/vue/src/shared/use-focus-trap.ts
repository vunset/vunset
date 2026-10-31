import { toValue, watch, onScopeDispose, nextTick, type MaybeRefOrGetter, type Ref } from 'vue';
import { getTabbableElements, focusFirst } from './focus';

export interface UseFocusTrapOptions {
  /** Whether the trap is active. */
  enabled: MaybeRefOrGetter<boolean>;
  /** The element to keep focus within. */
  container: Ref<HTMLElement | null>;
  /** Cycle Tab within the container rather than letting it escape. */
  modal?: MaybeRefOrGetter<boolean>;
  /** Move focus inside when it opens. */
  autoFocus?: MaybeRefOrGetter<boolean>;
  /** Whether the container is where it belongs yet. Auto-focus waits for it. */
  ready?: MaybeRefOrGetter<boolean>;
  /** Restore focus to whatever had it before opening. */
  returnFocus?: MaybeRefOrGetter<boolean>;
  /** Where focus goes back to when nothing had it, or what had it is gone: a trigger swapped in as it opened. */
  returnFallback?: () => HTMLElement | null;
}

/** Keeps keyboard focus inside an open popup and puts it back when the popup closes. */
export function useFocusTrap(options: UseFocusTrapOptions): void {
  let previouslyFocused: HTMLElement | null = null;
  let autoFocused = false;

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !toValue(options.modal ?? true)) return;

    const container = options.container.value;
    if (!container) return;

    const tabbable = getTabbableElements(container);
    if (tabbable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = tabbable[0];
    const last = tabbable[tabbable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  watch(
    () => toValue(options.enabled),
    (enabled, wasEnabled) => {
      // On the server the immediate run still happens, with no document to listen on.
      if (typeof document === 'undefined') return;

      if (enabled) {
        previouslyFocused = document.activeElement as HTMLElement | null;
        document.addEventListener('keydown', onKeydown, true);
        return;
      }

      autoFocused = false;
      document.removeEventListener('keydown', onKeydown, true);

      if (wasEnabled && toValue(options.returnFocus ?? true)) {
        const active = document.activeElement;
        const inside = options.container.value?.contains(active as Node) ?? false;
        const previous =
          previouslyFocused?.isConnected && previouslyFocused !== document.body
            ? previouslyFocused
            : (options.returnFallback?.() ?? previouslyFocused);
        if ((inside || active === document.body) && previous?.isConnected) {
          previous.focus();
        }
      }
      previouslyFocused = null;
    },
    // Immediate, or a popup that mounts already open is never trapped.
    { flush: 'post', immediate: true }
  );

  watch(
    () => toValue(options.enabled) && (options.ready === undefined || toValue(options.ready)),
    async (canFocus) => {
      if (!canFocus || autoFocused || !toValue(options.autoFocus ?? true)) return;

      autoFocused = true;

      await nextTick();
      if (options.container.value && toValue(options.enabled)) {
        focusFirst(options.container.value);
      }
    },
    { flush: 'post', immediate: true }
  );

  onScopeDispose(() => {
    document.removeEventListener('keydown', onKeydown, true);
  });
}
