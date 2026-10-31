# Theme

`useTheme()` sets the page's color scheme: `light`, `dark`, or whatever the
system prefers, and remembers the choice. It's what a theme switch calls.

```ts
import { useTheme } from '@vunset/vue';

const { theme, resolved, setTheme, toggle } = useTheme();

theme.value = 'dark'; // or setTheme('dark')
toggle(); // light ⇄ dark, from what is showing
resolved.value; // 'light' or 'dark', with 'system' worked out
```

## What it changes

On `<html>`:

| Set | To |
| --- | --- |
| `color-scheme` | `light`, `dark`, or `light dark` for the system's. `light-dark()` colors, such as `@vunset/ui`'s, follow it. |
| `data-theme` | What is showing, `light` or `dark`: a hook for the app's own CSS, `[data-theme='dark'] .logo { … }`. |

While on `system`, it follows the system as it changes. The choice is kept in
`localStorage` under `theme`.

## Options

The first call sets it up; later calls share the same choice.

| Option | Default | |
| --- | --- | --- |
| `storageKey` | `'theme'` | Where the choice is kept; `null` keeps it for the page's life only |
| `storage` | | Somewhere else to keep it: `{ get, set }`, [below](#somewhere-else) |
| `defaultTheme` | `'system'` | The choice before one is stored |
| `themeColor` | | `{ light, dark }`: the browser's UI color for each, written to `<meta name="theme-color">` |
| `viewTransition` | `false` | Cross-fades the page on a change, where the browser has view transitions and motion isn't reduced |

In Nuxt, [the module](/nuxt/theme) makes the first call, with its own
options: set them there.

## Somewhere else

`storage` keeps the choice wherever the app keeps its preferences. `get`
returns what is stored, and anything but `light`, `dark` or `system` counts as
nothing; `set` stores a new choice.

```ts
const settings = reactive({ theme: 'system', sidebar: true });

useTheme({
  storage: { get: () => settings.theme, set: (theme) => (settings.theme = theme) }
});
```

## Without a flash

`useTheme()` only runs once your app's script does. Until then, a user who
picked dark sees the page light for a moment. A small script in the
`<head>`, before any stylesheet, applies the stored choice straight away:

```html
<script>
  (function () {
    var t = localStorage.getItem('theme');
    var dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.style.colorScheme = t === 'light' || t === 'dark' ? t : 'light dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  })();
</script>
```

This script reads the `theme` key from `localStorage` and treats a missing
value as `system`. If you set a different `storageKey`, use your own
`storage`, or change `defaultTheme`, change the script to match.

On a server render there's no page to change: `useTheme()` applies nothing
and reports `system`, whatever `defaultTheme` says. The stored choice takes
over once the page loads.
