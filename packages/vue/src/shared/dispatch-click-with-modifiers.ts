/** Forwards a click or key press to the hidden input as a click, keeping the modifier keys. */
export function dispatchClickWithModifiers(
  target: HTMLElement,
  source: MouseEvent | KeyboardEvent,
  options: { bubbles?: boolean } = {}
): void {
  const clickEvent = new MouseEvent('click', {
    bubbles: options.bubbles ?? false,
    cancelable: true,
    composed: true,
    altKey: source.altKey,
    ctrlKey: source.ctrlKey,
    metaKey: source.metaKey,
    shiftKey: source.shiftKey,
    button: 'button' in source ? source.button : 0
  });

  target.dispatchEvent(clickEvent);
}
