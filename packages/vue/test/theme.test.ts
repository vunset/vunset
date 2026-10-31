import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useTheme } from '../src';
import { resetTheme } from '../src/composables/use-theme';

// A matchMedia the test can flip, standing in for the OS setting.
function stubSystem(dark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches: dark,
    addEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) => listeners.delete(fn)
  };
  window.matchMedia = vi.fn(() => query) as unknown as typeof window.matchMedia;
  return (next: boolean) => {
    query.matches = next;
    listeners.forEach((fn) => fn({ matches: next } as MediaQueryListEvent));
  };
}

const root = () => document.documentElement;

beforeEach(() => {
  resetTheme();
  localStorage.clear();
  root().removeAttribute('data-theme');
  root().style.colorScheme = '';
  document.head.querySelector('meta[name="theme-color"]')?.remove();
});

afterEach(() => resetTheme());

describe('useTheme', () => {
  it('follows the system by default, both schemes allowed', async () => {
    stubSystem(true);
    const { theme, resolved } = useTheme();

    expect(theme.value).toBe('system');
    expect(resolved.value).toBe('dark');
    expect(root().dataset.theme).toBe('dark');
    expect(root().style.colorScheme).toBe('light dark');
  });

  it('tracks the system while on system', async () => {
    const flip = stubSystem(false);
    const { resolved } = useTheme();
    expect(root().dataset.theme).toBe('light');

    flip(true);
    await nextTick();
    expect(resolved.value).toBe('dark');
    expect(root().dataset.theme).toBe('dark');
  });

  it('pins a scheme when set, and remembers it', async () => {
    stubSystem(false);
    const { setTheme } = useTheme();

    setTheme('dark');
    await nextTick();
    expect(root().dataset.theme).toBe('dark');
    expect(root().style.colorScheme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('starts from what was remembered', () => {
    stubSystem(false);
    localStorage.setItem('theme', 'dark');
    expect(useTheme().theme.value).toBe('dark');
    expect(root().dataset.theme).toBe('dark');
  });

  it('ignores a pinned scheme’s system changes', async () => {
    const flip = stubSystem(false);
    const { setTheme, resolved } = useTheme();
    setTheme('light');
    flip(true);
    await nextTick();
    expect(resolved.value).toBe('light');
  });

  it('toggles from what is showing', async () => {
    stubSystem(true);
    const { toggle, theme } = useTheme();
    toggle();
    await nextTick();
    expect(theme.value).toBe('light');
    toggle();
    expect(theme.value).toBe('dark');
  });

  it('shares one choice between callers, set through the theme ref too', async () => {
    stubSystem(false);
    const a = useTheme();
    const b = useTheme();
    a.theme.value = 'dark';
    await nextTick();
    expect(b.theme.value).toBe('dark');
  });

  it('takes its own storage key, or none, and a default', () => {
    stubSystem(false);
    useTheme({ storageKey: 'app-theme', defaultTheme: 'dark' }).setTheme('light');
    expect(localStorage.getItem('app-theme')).toBe('light');
    resetTheme();
    localStorage.clear();

    const { setTheme } = useTheme({ storageKey: null });
    setTheme('dark');
    expect(localStorage.length).toBe(0);
  });

  it('ignores a stored value it does not know', () => {
    stubSystem(false);
    localStorage.setItem('theme', 'sepia');
    expect(useTheme().theme.value).toBe('system');
  });

  it('keeps the choice in a storage of the app’s own', () => {
    stubSystem(false);
    const settings = { theme: 'dark' as unknown };
    const { setTheme, theme } = useTheme({ storage: { get: () => settings.theme, set: (value) => (settings.theme = value) } });

    expect(theme.value).toBe('dark');
    setTheme('system');
    expect(settings.theme).toBe('system');
    expect(localStorage.length).toBe(0);
  });

  it('writes the scheme’s theme-color', async () => {
    stubSystem(false);
    const { setTheme } = useTheme({ themeColor: { light: '#fff', dark: '#111' } });
    const meta = () => document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!;

    expect(meta().content).toBe('#fff');
    setTheme('dark');
    await nextTick();
    expect(meta().content).toBe('#111');
  });

  it('cross-fades a change with viewTransition, unless motion is reduced', () => {
    stubSystem(false);
    const transition = vi.fn((update: () => void) => {
      update();
      return { ready: Promise.resolve() };
    });
    document.startViewTransition = transition as unknown as typeof document.startViewTransition;

    const { setTheme } = useTheme({ viewTransition: true });
    setTheme('dark');
    expect(transition).toHaveBeenCalledTimes(1);
    expect(root().dataset.theme).toBe('dark');

    stubSystem(true); // Every media query matches now, `prefers-reduced-motion` among them.
    setTheme('light');
    expect(transition).toHaveBeenCalledTimes(1);

    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });

  it('starts one transition when the storage sets the same choice again before it shows', async () => {
    stubSystem(false);
    // As a browser does: the update runs later, once the old page is captured.
    const updates: (() => void)[] = [];
    const transition = vi.fn((update: () => void) => {
      updates.push(update);
      return { ready: Promise.resolve() };
    });
    document.startViewTransition = transition as unknown as typeof document.startViewTransition;

    // Like the Nuxt plugin's settings: a write is echoed back as a new choice.
    let echo: ((value: 'light' | 'dark' | 'system') => void) | undefined;
    const theme = useTheme({ viewTransition: true, storage: { get: () => null, set: (value) => echo?.(value) } });
    echo = theme.setTheme;

    theme.toggle();
    expect(transition).toHaveBeenCalledTimes(1);

    updates.forEach((update) => update());
    await nextTick();
    expect(theme.resolved.value).toBe('dark');

    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });

  it('warns once in development when a later call brings options it ignores', () => {
    stubSystem(false);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    useTheme({ defaultTheme: 'dark' });
    useTheme();
    useTheme({ themeColor: { light: '#fff', dark: '#000' } });
    useTheme({ viewTransition: true });

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
