import { defineNuxtPlugin, updateAppConfig, useAppConfig, useRuntimeConfig } from '#app';
import { reactive, watch } from 'vue';
import { useLocalStorage, useTheme, type ThemeMode, type UseThemeOptions } from '@vunset/vue';

/** An app's preferences in `app.config`, kept in `localStorage` under `key`: the theme is one of them. */
interface Settings {
  key?: string;
  theme?: unknown;
  themeColor?: UseThemeOptions['themeColor'];
  [name: string]: unknown;
}

interface ThemeConfig {
  default?: ThemeMode;
  storageKey?: string | null;
  themeColor?: UseThemeOptions['themeColor'];
  viewTransition?: boolean;
}

const MODES: unknown[] = ['light', 'dark', 'system'];

// Before any component asks for the theme, so these options are the ones it starts with.
export default defineNuxtPlugin({
  name: 'vunset:theme',
  setup() {
    const options = (useRuntimeConfig().public.vunset as { theme?: ThemeConfig } | undefined)?.theme ?? {};
    const config = useAppConfig() as { settings?: Settings };
    const key = config.settings?.key;

    // The whole of `settings` is remembered, not only the theme: sidebar, bookmarks, ...
    if (import.meta.client && key) {
      const { getItem, setItem } = useLocalStorage();
      const saved = getItem<Settings>(key);
      if (saved) updateAppConfig({ settings: saved });
      watch(() => config.settings, (settings) => setItem(key, settings), { deep: true });
    }

    const theme = useTheme({
      defaultTheme: options.default,
      themeColor: config.settings?.themeColor ?? options.themeColor,
      viewTransition: options.viewTransition ?? true,
      ...(key
        ? { storage: { get: () => config.settings!.theme, set: (value: ThemeMode) => (config.settings!.theme = value) } }
        : { storageKey: options.storageKey })
    });

    // `settings.theme` set by the app itself, or by `updateAppConfig`, is followed too.
    if (key) {
      watch(
        () => config.settings?.theme,
        (value) => {
          if (MODES.includes(value) && value !== theme.theme.value) theme.setTheme(value as ThemeMode);
        }
      );
    }

    return {
      provide: {
        // Reactive, so a template reads `$theme.current` without `.value`. `current` and
        // `toggleTheme` are the old layer's names for `resolved` and `toggle`.
        theme: reactive({ ...theme, current: theme.resolved, toggleTheme: theme.toggle })
      }
    };
  }
});
