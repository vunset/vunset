/** Whether `element` lays out right to left, set by a `dir` attribute or CSS `direction`. */
export function isRtl(element: Element | null | undefined): boolean {
  return !!element && getComputedStyle(element).direction === 'rtl';
}

/** `key` as it would read left to right: in a right-to-left `element`, ArrowLeft and ArrowRight swap. */
export function logicalKey(key: string, element: EventTarget | null | undefined): string {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return key;
  if (!(element instanceof Element) || !isRtl(element)) return key;
  return key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
}
