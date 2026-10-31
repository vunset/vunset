# AppContextMenu

The menu that opens on a right-click, or a long press on a touch screen,
instead of the browser's own. Built on [Context menu](/navigation/context-menu).

::: preview ui/app-context-menu/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppContextMenu, AppMenuItems, type AppMenuEntry } from '@vunset/ui';

const items: AppMenuEntry[] = [
  { label: 'Copy', shortcut: '⌘C', onSelect: copy },
  { type: 'separator' },
  { label: 'Delete', tone: 'danger', onSelect: remove }
];
</script>

<template>
  <AppContextMenu class="canvas">
    <template #trigger>…the area…</template>

    <AppMenuItems :items="items" />
  </AppContextMenu>
</template>
```

`#trigger` is the area where right-clicking opens the menu. It renders as a
`div` (or whatever `as` says), and `class` and other attributes go on it, so
you size and style the area yourself.

The default slot is what the menu shows. [`AppMenuItems`](/ui/app-menu#the-items-alone)
draws an `items` array just like AppMenu: icons, shortcuts, separators,
groups, checkboxes, radio sets and submenus. Choosing an item runs its
`onSelect` and emits `select`.

The menu opens with its corner at the pointer. `side` and `align` change that.
`long-press-delay` is how long a touch has to be held to open it, 500 ms by
default. `disabled` brings back the browser's own menu.

## Examples

### Content of your own

Instead of `AppMenuItems`, you can use any menu parts from `@vunset/vue`:
`MenuItem`, `MenuGroup`, `Separator`. Give them AppMenu's classes
(`app-menu-item`, `app-menu-group-label`, `app-menu-separator`) for the same
look, or style them your own way.

::: preview ui/app-context-menu/Custom
:::

## Keyboard

The keys inside the menu are [AppMenu's](/ui/app-menu#keyboard).
<kbd>Shift</kbd> <kbd>F10</kbd> or the context-menu key also open it, while
focus is inside the area. If nothing in the area can take focus, give it
`tabindex="0"`. Even so, it's best to offer the same actions somewhere else
too, since many people never right-click.

## Styling

| Class | On |
| --- | --- |
| `app-context-menu-area` | The area: no look of its own, only no system callout on a long press |
| `app-menu`, `app-surface` | The menu, as AppMenu's |

`popup-class` adds classes to the menu (see
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts)). The
items use [AppMenu's classes](/ui/app-menu#styling). To fit your own layers
above or below it, see [stacking](/ui/theming#stacking).

## API Reference

### AppContextMenu

::: api app/AppContextMenu
:::

### AppMenuItems

::: api app/AppMenuItems
:::
