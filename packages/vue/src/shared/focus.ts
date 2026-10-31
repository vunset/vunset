const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',');

/** Elements inside `container` that can currently receive keyboard focus, in tab order. */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true'
  );
}

/** Focus never scrolls the page here. */
export function focusFirst(container: HTMLElement): void {
  const tabbable = getTabbableElements(container);
  // An `autofocus` element wins, so a confirmation can start on its safe answer.
  const first = tabbable.find((el) => el.hasAttribute('autofocus')) ?? tabbable[0];
  if (first) {
    first.focus({ preventScroll: true });
    return;
  }
  if (container.getAttribute('tabindex') === null) {
    container.setAttribute('tabindex', '-1');
  }
  container.focus({ preventScroll: true });
}

/** Scrolls `container` just enough to reveal `item`, and nothing else. */
export function scrollIntoViewWithin(item: HTMLElement, container: HTMLElement | null): void {
  if (!container || container.scrollHeight <= container.clientHeight) return;

  const itemBox = item.getBoundingClientRect();
  const containerBox = container.getBoundingClientRect();

  if (itemBox.top < containerBox.top) {
    container.scrollTop -= containerBox.top - itemBox.top;
  } else if (itemBox.bottom > containerBox.bottom) {
    container.scrollTop += itemBox.bottom - containerBox.bottom;
  }
}
