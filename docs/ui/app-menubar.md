# AppMenubar

A row of menus, as at the top of a desktop app. Built on
[Menubar](/navigation/menubar), with an [AppMenu](/ui/app-menu) for each menu,
so every menu takes the same `items`.

::: preview ui/app-menubar/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppMenubar, type AppMenubarEntry } from '@vunset/ui';

const items: AppMenubarEntry[] = [
  { label: 'File', items: [{ label: 'New file', onSelect: create }] },
  { label: 'Edit', items: [{ label: 'Undo', onSelect: undo }] }
];
</script>

<template>
  <AppMenubar :items="items" />
</template>
```

`items` describes the whole bar. Each menu in it is
`{ label, items, disabled }`, and its `items` are the same entries
[AppMenu](/ui/app-menu#usage) takes: items, separators, groups, checkboxes,
radio sets and submenus. Choosing an item in any menu runs its `onSelect` and
emits `select`.

Once a menu is open, hovering another one switches to it. `open-on-hover`
opens the first one on hover too. `disabled` turns off the whole bar.

## Examples

### Links

`{ label, to }` puts a link in the bar between the menus, and `to` on an item
makes that item a link. By default a link is an `<a>` with `to` as its
`href`. To use your router's link, pass it as `link` (then `to` is a route),
or set it once for the whole app with [`configureLink`](/utilities/links). In
Nuxt, links are `NuxtLink`s already.

```vue
<AppMenubar :items="items" :link="RouterLink" />
```

A link in the bar is part of the arrow-key order. Moving to it, by key or by
pointer, closes the open menu. Enter follows the link, and closes the menu if
the link was an item in it. A disabled link stays an `<a>` but goes nowhere.
A router link marks the current page with `aria-current="page"`, which draws
it as pressed.

::: preview ui/app-menubar/Links
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Move between the menus, from a trigger or from inside an open menu |
| <kbd>↓</kbd> <kbd>Enter</kbd> <kbd>Space</kbd> | Open the focused menu |
| <kbd>Esc</kbd> | Close the menu, back to its trigger |

Inside a menu, the keys are [AppMenu's](/ui/app-menu#keyboard).

## Styling

| Class | On |
| --- | --- |
| `app-menubar` | The bar |
| `app-menubar-trigger` | Each menu's trigger, with `data-open` and `data-disabled`, and each link in the bar |

The menus use [AppMenu's classes](/ui/app-menu#styling). For your own, use
`trigger-class` (every trigger in the bar), `popup-class` (every menu and
submenu) and `item-class` (every item). See
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts). The
`#trigger` slot replaces a trigger's text and gets its `menu`.

<<< ../../packages/ui/src/app/app-menubar.css

## API Reference

### AppMenubar

::: api app/AppMenubar
:::
