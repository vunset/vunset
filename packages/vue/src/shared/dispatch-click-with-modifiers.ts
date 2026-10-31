/**
 * Forwards a click from a custom control to its hidden native input, or turns a
 * key press into the click it stands for, preserving the modifier keys so that
 * behaviors keyed off them (for example a middle/ctrl-click on an enclosing
 * link) stay consistent.
 */
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
