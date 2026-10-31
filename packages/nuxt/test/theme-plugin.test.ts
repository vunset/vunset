// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { resetTheme } from '../../vue/src/composables/use-theme';

const app = vi.hoisted(() => ({ config: {} as Record<string, any>, runtime: {} as Record<string, any> }));

vi.mock('#app', () => ({
  defineNuxtPlugin: (plugin: unknown) => plugin,
  useAppConfig: () => app.config,
  useRuntimeConfig: () => ({ public: { vunset: { theme: app.runtime } } }),
  // Nuxt's merge: nested objects in place, everything else replaced.
  updateAppConfig: (next: Record<string, any>) => {
    const assign = (target: Record<string, any>, source: Record<string, any>) => {
      for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) assign((target[key] ??= {}), value);
        else target[key] = value;
      }
    };
    assign(app.config, next);
  }
}));

const { default: plugin } = (await import('../src/runtime/theme')) as any;

function run(config: Record<string, any>, runtime: Record<string, any> = {}) {
  app.config = reactive(config);
  app.runtime = runtime;
  return plugin.setup().provide.theme;
}

beforeEach(() => {
  resetTheme();
  localStorage.clear();
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as any;
});

describe('the theme plugin', () => {
  it('restores the app’s settings, and keeps the theme in them', async () => {
    localStorage.setItem('app-settings', JSON.stringify({ theme: 'dark', sidebar: false }));
    const theme = run({ settings: { key: 'app-settings', theme: 'system', sidebar: true, bookmarks: [] } });

    expect(app.config.settings.sidebar).toBe(false);
    expect(theme.current).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    theme.toggleTheme();
    await nextTick();
    expect(app.config.settings.theme).toBe('light');
    expect(JSON.parse(localStorage.getItem('app-settings')!)).toEqual({
      key: 'app-settings',
      theme: 'light',
      sidebar: false,
      bookmarks: []
    });
  });

  it('remembers every setting, not only the theme', async () => {
    run({ settings: { key: 'app-settings', theme: 'system', sidebar: true } });
    app.config.settings.sidebar = false;
    await nextTick();
    expect(JSON.parse(localStorage.getItem('app-settings')!).sidebar).toBe(false);
  });

  it('follows settings.theme set by the app', async () => {
    const theme = run({ settings: { key: 'app-settings', theme: 'light' } });
    app.config.settings.theme = 'dark';
    await nextTick();
    expect(theme.theme).toBe('dark');
    expect(theme.resolved).toBe('dark');
  });

  it('keeps the choice under its own key without settings, starting from the module’s default', () => {
    const theme = run({}, { default: 'dark', storageKey: 'mode' });
    expect(theme.current).toBe('dark');

    theme.theme = 'light';
    expect(localStorage.getItem('mode')).toBe('light');
  });

  it('writes the theme-color from settings', () => {
    run({ settings: { key: 'app-settings', theme: 'dark', themeColor: { light: '#fff', dark: '#18181b' } } });
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!.content).toBe('#18181b');
  });

  it('cross-fades a toggle once, though writing settings.theme comes back through its watcher', async () => {
    const updates: (() => void)[] = [];
    const transition = vi.fn((update: () => void) => {
      updates.push(update);
      return { ready: Promise.resolve() };
    });
    document.startViewTransition = transition as unknown as typeof document.startViewTransition;

    const theme = run({ settings: { key: 'app-settings', theme: 'light' } });
    theme.toggleTheme();
    await nextTick();
    expect(transition).toHaveBeenCalledTimes(1);

    updates.forEach((update) => update());
    await nextTick();
    expect(theme.current).toBe('dark');
    expect(app.config.settings.theme).toBe('dark');

    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });
});
