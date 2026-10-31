import { computed, ref, watch, type ComputedRef, type WritableComputedRef } from 'vue';
import { storage } from './use-local-storage';

/** What the user chose: a scheme, or whatever the system prefers. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Where the choice is kept: `localStorage` by default, or anything else, an app's settings object included. */
export interface ThemeStorage {
  /** The stored choice; anything but a `ThemeMode` counts as none. */
  get: () => unknown;
  set: (theme: ThemeMode) => void;
}

export interface UseThemeOptions {
  /** Where the choice is remembered, in `localStorage`. `null` keeps it for the page's life only. @default 'theme' */
  storageKey?: string | null;
  /** Keeps the choice somewhere else than `localStorage`; `storageKey` is then unused. */
  storage?: ThemeStorage;
  /** The choice before anything is stored. @default 'system' */
  defaultTheme?: ThemeMode;
  /** The browser's UI color for each scheme, written to `<meta name="theme-color">`. */
  themeColor?: { light: string; dark: string };
  /** Cross-fades the page on a change, where the browser has view transitions and motion isn't reduced. */
  viewTransition?: boolean;
}

export interface UseThemeReturn {
  /** The choice, settable: `light`, `dark` or `system`. */
  theme: WritableComputedRef<ThemeMode>;
  /** What is showing: `system` resolved to `light` or `dark`. */
  resolved: ComputedRef<'light' | 'dark'>;
  setTheme: (theme: ThemeMode) => void;
  /** Light to dark and back, from what is showing; leaves `system`. */
  toggle: () => void;
}

const MODES: ThemeMode[] = ['light', 'dark', 'system'];

const isThemeMode = (value: unknown): value is ThemeMode => MODES.includes(value as ThemeMode);

/** A raw string under `key`, as `useTheme` has always stored it. */
function localStorageTheme(key: string): ThemeStorage {
  return {
    get: () => storage()?.getItem(key),
    set(value) {
      try {
        storage()?.setItem(key, value);
      } catch {
        // Storage full or refused: the choice lasts the page's life.
      }
    }
  };
}

// One choice for the page, however many components ask for it.
const mode = ref<ThemeMode>('system');
const systemDark = ref(false);
let started = false;
let store: ThemeStorage | null = null;
let settings: UseThemeOptions = {};
let stop: (() => void) | null = null;
let warned = false;

const resolved = computed<'light' | 'dark'>(() =>
  mode.value === 'system' ? (systemDark.value ? 'dark' : 'light') : mode.value
);

// `color-scheme` is what `light-dark()` colors follow; `data-theme` is a hook for the app's own CSS.
function apply() {
  const root = document.documentElement;
  root.style.colorScheme = mode.value === 'system' ? 'light dark' : mode.value;
  root.dataset.theme = resolved.value;

  const color = settings.themeColor?.[resolved.value];
  if (!color) return;
  let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
  }
  meta.content = color;
}

function start(options: UseThemeOptions) {
  started = true;
  settings = options;
  store = options.storage ?? (options.storageKey === null ? null : localStorageTheme(options.storageKey ?? 'theme'));

  const stored = store?.get();
  mode.value = isThemeMode(stored) ? stored : (options.defaultTheme ?? 'system');

  const query = window.matchMedia?.('(prefers-color-scheme: dark)');
  const follow = (event: MediaQueryListEvent) => (systemDark.value = event.matches);
  if (query) {
    systemDark.value = query.matches;
    query.addEventListener?.('change', follow);
  }

  const unwatch = watch([mode, resolved], apply, { immediate: true });
  stop = () => {
    unwatch();
    query?.removeEventListener?.('change', follow);
  };
}

// The choice a view transition is about to apply: until its callback runs, `mode` still holds the old one.
let pending: ThemeMode | null = null;

function setTheme(value: ThemeMode) {
  // Set again before it shows (a storage that echoes the write back), it would start a
  // second transition, which skips the first.
  if (value === (pending ?? mode.value)) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (settings.viewTransition && !reduced && document.startViewTransition) {
    // Taken before the write, which may come straight back here.
    pending = value;
    store?.set(value);
    // Applied inside the callback, so the browser has the old page to fade from.
    const transition = document.startViewTransition(() => {
      pending = null;
      mode.value = value;
      apply();
    });
    // Skipped by a quicker change (two fast toggles): the change still lands, without the fade.
    transition.ready.catch(() => {});
  } else {
    pending = null;
    mode.value = value;
    store?.set(value);
  }
}

/**
 * The page's color scheme: light, dark, or the system's, applied to `<html>` and
 * remembered. Every call shares one choice; the first call's options set it up.
 */
export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  // A server render has no page to theme: it gets the default, applied by nothing.
  if (!started && typeof window !== 'undefined') start(options);
  else if (process.env.NODE_ENV !== 'production' && started && !warned && Object.keys(options).length > 0) {
    warned = true;
    console.warn('[useTheme] Already set up by an earlier call (in Nuxt, the module): these options are ignored.');
  }

  return {
    theme: computed({ get: () => mode.value, set: setTheme }),
    resolved,
    setTheme,
    toggle: () => setTheme(resolved.value === 'dark' ? 'light' : 'dark')
  };
}

/**
 * For a test, or an app that tears its page down: forgets the choice and the
 * listeners, so the next `useTheme` starts over.
 * @internal
 */
export function resetTheme() {
  stop?.();
  stop = null;
  started = false;
  warned = false;
  pending = null;
  store = null;
  settings = {};
  mode.value = 'system';
  systemDark.value = false;
}
