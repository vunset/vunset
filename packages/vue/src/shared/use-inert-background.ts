import { getCurrentInstance, onMounted, toValue, watch, onScopeDispose, type MaybeRefOrGetter, type Ref } from 'vue';

interface Touched {
  element: HTMLElement;
  hadInert: boolean;
  previousAriaHidden: string | null;
}

/** Hides everything outside a modal surface from assistive technology. */
export function useInertBackground(enabled: MaybeRefOrGetter<boolean>, container: Ref<HTMLElement | null>): void {
  let touched: Touched[] = [];

  function release() {
    for (const { element, hadInert, previousAriaHidden } of touched) {
      if (!hadInert) element.removeAttribute('inert');

      if (previousAriaHidden === null) {
        element.removeAttribute('aria-hidden');
      } else {
        element.setAttribute('aria-hidden', previousAriaHidden);
      }
    }

    touched = [];
  }

  function acquire() {
    if (typeof document === 'undefined' || touched.length > 0) return;

    const surface = container.value;

    for (const child of Array.from(document.body.children)) {
      if (!(child instanceof HTMLElement)) continue;

      if (surface && child.contains(surface)) continue;

      touched.push({
        element: child,
        hadInert: child.hasAttribute('inert'),
        previousAriaHidden: child.getAttribute('aria-hidden')
      });

      child.setAttribute('inert', '');
      child.setAttribute('aria-hidden', 'true');
    }
  }

  // Freed before the render, so a focus trap returning focus after it finds the page usable:
  // a browser ignores `focus()` on anything inert.
  watch(
    () => toValue(enabled),
    (on) => on || release(),
    { flush: 'pre' }
  );

  // Taken only once the surface is in the page to leave out: it can render a tick after `enabled`,
  // and taken before, a container it teleports into (Nuxt's `#teleports`) would go inert with it.
  watch(
    () => (toValue(enabled) ? container.value : null),
    (surface) => surface && acquire(),
    { flush: 'post' }
  );

  // Enabled from the start (mounted already open), with the surface already set.
  if (getCurrentInstance()) {
    onMounted(() => {
      if (toValue(enabled) && container.value) acquire();
    });
  }

  onScopeDispose(release);
}
