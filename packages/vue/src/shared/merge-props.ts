import { normalizeClass, normalizeStyle } from 'vue';

/** A DOM event whose caller-side handler can stop the library's own handler. */
export type PreventableEvent<E extends Event = Event> = E & {
  /** Skips the handlers merged in before this one — the library's own. */
  preventInternalHandler: () => void;
};

export type EventHandler = (...args: any[]) => any;

type Props = Record<string, any>;

const LISTENER = /^on[A-Z]/;

/**
 * Merges sets of Vue props; a later set wins a conflict, as with `Object.assign`.
 *
 * - `class` and `style` from every set are combined, later declarations winning.
 * - `onXxx` listeners from every set all run, the last set's first. The library
 *   passes its own bag first and the caller's attrs last, so the caller's
 *   handler runs first and can call `event.preventInternalHandler()` to skip
 *   the ones before it.
 */
export function mergeProps(...sets: (Props | undefined)[]): Props {
  const merged: Props = {};
  const listeners = new Map<string, EventHandler[][]>();
  const classes: unknown[] = [];
  const styles: unknown[] = [];

  for (const set of sets) {
    if (!set) continue;

    for (const [key, value] of Object.entries(set)) {
      if (key === 'class') classes.push(value);
      else if (key === 'style') styles.push(value);
      else if (LISTENER.test(key) && isListenerValue(value)) addListeners(listeners, key, value);
      else merged[key] = value;
    }
  }

  const className = normalizeClass(classes);
  if (className) merged.class = className;

  const style = normalizeStyle(styles);
  if (style && Object.keys(style).length > 0) merged.style = style;

  for (const [key, groups] of listeners) merged[key] = dispatcher(groups);

  return merged;
}

/** A listener prop may hold one function, several (as Vue itself merges them), or nothing. */
function isListenerValue(value: unknown): boolean {
  return value === undefined || typeof value === 'function' || Array.isArray(value);
}

/** Keeps each set's listeners as a group, so an array keeps its own order. */
function addListeners(listeners: Map<string, EventHandler[][]>, key: string, value: unknown): void {
  const group = [value].flat().filter((handler): handler is EventHandler => typeof handler === 'function');
  if (group.length === 0) return;

  const groups = listeners.get(key);
  if (groups) groups.push(group);
  else listeners.set(key, [group]);
}

/**
 * One listener running the sets' groups from the last to the first. A DOM
 * event gets `preventInternalHandler` even when there is a single handler, so a
 * caller can call it without knowing whether the library attached one; its
 * effect ends with this element's handlers, not with the event.
 */
function dispatcher(groups: EventHandler[][]): EventHandler {
  const [outermost, ...inner] = [...groups].reverse().flat();

  return (...args: unknown[]) => {
    const [event] = args;
    let skipRest = false;

    if (typeof Event !== 'undefined' && event instanceof Event) {
      (event as PreventableEvent).preventInternalHandler = () => {
        skipRest = true;
      };
    }

    const result = outermost!(...args);

    for (const handler of inner) {
      if (skipRest) break;
      handler(...args);
    }

    return result;
  };
}
