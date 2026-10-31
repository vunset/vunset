# Theme

The module sets up light and dark mode for you, with
[`useTheme`](/utilities/theme). In a template, `$theme` gives you the current
theme and a way to change it:

```vue
<button type="button" @click="$theme.toggle">
  <AppIcon :name="$theme.resolved === 'dark' ? 'moon' : 'sun'" />
</button>
```

- `$theme.theme`: what the user picked, `'light'`, `'dark'` or `'system'`.
  You can set it.
- `$theme.resolved`: what's actually showing, `'light'` or `'dark'`.
- `$theme.toggle()` and `$theme.setTheme(value)` change it.

## Options

The choice is remembered in `localStorage`, and the page cross-fades when it
changes. To change how it works, pass an object instead of `true`:

```ts
export default defineNuxtConfig({
  modules: ['@vunset/nuxt'],
  vunset: {
    theme: { default: 'dark', viewTransition: false }
  }
});
```

| `theme` option   |                                                                          |
| ---------------- | ------------------------------------------------------------------------ |
| `default`        | The theme before the user picks one, `'system'` by default.              |
| `storageKey`     | Where the choice is saved, `'theme'` by default. `null` doesn't save it. |
| `themeColor`     | Sets `<meta name="theme-color">` for light and dark.                     |
| `viewTransition` | `false` turns the cross-fade off.                                        |

`theme: false` leaves it all to you.

## Keeping settings in `app.config`

If your app keeps its preferences in `app.config` under `settings`, with a
`key`, the module saves and restores the whole object in `localStorage` under
that key. The theme goes in `settings.theme`, and `settings.themeColor` sets
the theme color:

```ts
// app.config.ts
export default defineAppConfig({
  settings: {
    key: 'my-app-settings',
    theme: 'system',
    themeColor: { light: '#ffffff', dark: '#18181b' },
    sidebarExpanded: true
  }
});
```

Setting `settings.theme` from your app changes the theme too. The saved
choice is read once the page loads, not during server rendering.
