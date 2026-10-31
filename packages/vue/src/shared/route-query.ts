import type { InjectionKey } from 'vue';

/**
 * The app's URL query, for a part that keeps its state there: a data table's
 * sort. The library has no router; an app provides one through this, and the
 * Nuxt module provides Nuxt's. `get` must be reactive.
 *
 * ```ts
 * app.provide(routeQueryKey, {
 *   get: (key) => router.currentRoute.value.query[key] as string | undefined,
 *   set: (key, value) => router.push({ query: { ...router.currentRoute.value.query, [key]: value } })
 * });
 * ```
 */
export interface RouteQuery {
  get: (key: string) => string | undefined;
  /** `undefined` removes the key. */
  set: (key: string, value: string | undefined) => void;
  /** Several keys in one navigation, so the second write doesn't start from a URL without the first. */
  setMany?: (entries: Record<string, string | undefined>) => void;
}

/** Writes made in the same tick, sent together: one navigation through `setMany`, or one `set` each. */
export function batchRouteQuery(routeQuery: RouteQuery): (key: string, value: string | undefined) => void {
  let pending: Record<string, string | undefined> | null = null;
  return (key, value) => {
    if (!pending) {
      pending = {};
      queueMicrotask(() => {
        const entries = pending!;
        pending = null;
        if (routeQuery.setMany) routeQuery.setMany(entries);
        else for (const [name, next] of Object.entries(entries)) routeQuery.set(name, next);
      });
    }
    pending[key] = value;
  };
}

export const routeQueryKey: InjectionKey<RouteQuery> = Symbol('vunset:route-query');
