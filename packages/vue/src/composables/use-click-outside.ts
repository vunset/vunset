import { getCurrentScope, onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue';
import { elementOf } from '../shared/element-of';
import { isInsideDismissLayer } from '../shared/dismiss-stack';

/** An element, a component, or a list of either: a template ref, a getter or the value itself. */
export type ClickOutsideTarget = MaybeRefOrGetter<unknown>;

export interface UseClickOutsideOptions {
  /** More that counts as inside: the button that toggles the target, say. */
  ignore?: ClickOutsideTarget[];
  /** @default true */
  enabled?: MaybeRefOrGetter<boolean | undefined>;
}

function elementsOf(targets: ClickOutsideTarget[]): Element[] {
  return targets
    .flatMap((target) => {
      const value = toValue(target);
      return Array.isArray(value) ? value.map((item) => toValue(item)) : [value];
    })
    .map(elementOf)
    .filter((element): element is HTMLElement => element !== null);
}

/**
 * Calls `handler` on a press outside `target`. A press inside an open overlay
 * (a menu, a select's list) counts as inside, wherever it is portaled to, and
 * nothing fires while `target` isn't on the page. Returns a function that stops
 * listening; it also stops with the component.
 */
export function useClickOutside(
  target: ClickOutsideTarget,
  handler: (event: PointerEvent) => void,
  options: UseClickOutsideOptions = {}
): () => void {
  if (typeof document === 'undefined') return () => {};

  // Pointerdown in the capture phase, as the overlays' own dismissal: a panel
  // and a menu inside it close on the same press.
  function onPointerDown(event: PointerEvent): void {
    if (!(toValue(options.enabled) ?? true)) return;

    const inside = elementsOf([target]);
    if (inside.length === 0) return;

    const path = event.composedPath();
    if ([...inside, ...elementsOf(options.ignore ?? [])].some((element) => path.includes(element))) return;
    if (isInsideDismissLayer(path)) return;

    handler(event);
  }

  document.addEventListener('pointerdown', onPointerDown, true);
  const stop = () => document.removeEventListener('pointerdown', onPointerDown, true);

  if (getCurrentScope()) onScopeDispose(stop);
  return stop;
}
