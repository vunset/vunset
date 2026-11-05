/** The element a ref points at. A ref to a fragment root (an `as="child"` popover) is its opening text marker, so the element is the next one. */
export function elementOf(ref: unknown): HTMLElement | null {
  let node = (ref && typeof ref === 'object' && '$el' in ref ? (ref as { $el: unknown }).$el : ref) as Node | null;
  while (node && !(node instanceof Element)) node = node.nextSibling;
  return (node as HTMLElement | null) ?? null;
}
