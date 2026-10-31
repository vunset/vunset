export interface UseLocalStorageReturn {
  /** The value stored under `key`, parsed; `undefined` when there is none, or it doesn't parse. */
  getItem: <T>(key: string) => T | undefined;
  /** Stores `data` as JSON. Nothing to store (`null`, `undefined`, an empty list) removes the key. */
  setItem: (key: string, data: unknown) => void;
  removeItem: (key: string) => void;
}

// No storage on a server, or in a browser that blocks it: reads find nothing, writes do nothing.
/** @internal Also `useTheme`'s. */
export function storage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

/** JSON in `localStorage`, safe to call where there is none. */
export function useLocalStorage(): UseLocalStorageReturn {
  return {
    getItem<T>(key: string) {
      const store = storage();
      const raw = store?.getItem(key);
      if (!raw) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        // Unreadable: dropped, so the next read doesn't fail the same way.
        store?.removeItem(key);
        return undefined;
      }
    },
    setItem(key, data) {
      if (data === null || data === undefined || (Array.isArray(data) && data.length === 0)) {
        storage()?.removeItem(key);
      } else {
        storage()?.setItem(key, JSON.stringify(data));
      }
    },
    removeItem(key) {
      storage()?.removeItem(key);
    }
  };
}
