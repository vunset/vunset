/**
 * The element a template ref points at. A ref on a part rendered `as="child"`
 * around a component whose root is a fragment (a popover, with its trigger and
 * a portal) is the fragment's opening marker, a text node: the element is the
 * first one after it.
 */
export function elementOf(ref: unknown): HTMLElement | null {
  let node = (ref && typeof ref === 'object' && '$el' in ref ? (ref as { $el: unknown }).$el : ref) as Node | null;
  while (node && !(node instanceof Element)) node = node.nextSibling;
  return (node as HTMLElement | null) ?? null;
}
