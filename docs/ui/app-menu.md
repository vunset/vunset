# AppMenu

A list of actions that opens from a trigger. You describe it with one
`items` array: items with icons and shortcuts, separators, groups with
headings, checkboxes, radio sets and submenus. Built on
[Menu](/navigation/menu).

::: preview ui/app-menu/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppMenu, AppButton, type AppMenuEntry } from '@vunset/ui';

const items: AppMenuEntry[] = [
  { label: 'Rename', shortcut: 'F2', onSelect: rename },
  { label: 'Move to', items: [{ label: 'Archive', onSelect: archive }] },
  { type: 'separator' },
  { label: 'Delete', tone: 'danger', onSelect: remove }
];
</script>

<template>
  <AppMenu trigger="Actions" :as="AppButton" variant="outline" :items="items" />
</template>
```

Each entry is one of:

| Entry | Fields |
| --- | --- |
| An item | `label`, `icon` (an [AppIcon](/ui/app-icon) name, or a component or `h()` drawn as it is), `shortcut`, `tone: 'danger'`, `disabled`, `class`, `onSelect`, `to` (a link) |
| A submenu | an item with `items` |
| `{ type: 'separator' }` | A line between items |
| `{ type: 'group' }` | `label` (the heading) and `items` |
| `{ type: 'checkbox' }` | `label`, `checked` and `onChange` |
| `{ type: 'radio' }` | `label` (a heading), `value`, `options` and `onChange` |

Choosing an item runs its `onSelect`, emits `select` with the item, and
closes the menu. A `shortcut` is only displayed. Binding the keys is up to
you.

The trigger works as on [AppDialog](/ui/app-dialog#usage): `trigger` is its
text, `as` renders it as anything else, and attributes that aren't the menu's
props go to it.

## Examples

### Checkboxes and radio sets

A checkbox shows `checked` and calls `onChange` when toggled. A radio set
does the same with `value`. Build the items in a `computed` so they always
show the current value. Toggling either one keeps the menu open.

::: preview ui/app-menu/Choices
:::

### A text trigger, opening on hover

Without `as`, the trigger is an underlined text button that reads as part of
the sentence. `open-on-hover` opens the menu when the pointer rests on it.

::: preview ui/app-menu/Text
:::

### The items alone

`AppMenuItems` is just the list AppMenu draws. Use it inside any menu popup,
like an [AppContextMenu](/ui/app-context-menu)'s, and give it `items`. It takes
`item-class`, `popup-class` (for its submenus) and the `#item` slot, and emits
`select`.

```vue
<AppContextMenu>
  <template #trigger>…</template>
  <AppMenuItems :items="items" @select="log" />
</AppContextMenu>
```

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> <kbd>Space</kbd> <kbd>↓</kbd> | On the trigger, open the menu |
| <kbd>↑</kbd> <kbd>↓</kbd> | Move between items, wrapping unless `:loop="false"` |
| <kbd>→</kbd> | Open a submenu |
| <kbd>←</kbd> | Close a submenu, back to its item |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Choose the item |
| <kbd>Esc</kbd> | Close the menu |
| A letter | Move to the next item starting with it |

## Styling

| Class | On |
| --- | --- |
| `app-menu` | The menu and each submenu, with `data-side` |
| `app-menu-trigger` | The default trigger, given no `as`: an underlined text button |
| `app-menu-item` | Every item, checkbox, radio and submenu trigger, with `data-tone`, `data-disabled`, `data-open` |
| `app-menu-text` | An item's label |
| `app-menu-icon` | An item's icon |
| `<kbd>` element | An item's shortcut, drawn as a key cap by [kbd.css](/ui/kbd) |
| `app-menu-chevron` | The arrow on a submenu's item |
| `app-menu-indicator` | A checkbox's check or a radio's dot, `data-unchecked` while off |
| `app-menu-group` | A group or a radio set |
| `app-menu-group-label` | A group's or a radio set's heading |
| `app-menu-separator` | A separator, beside [`app-separator`](/ui/app-separator): run out to the popup's edges |
| `app-menu-arrow` | The arrow, with `arrow` |

For classes on the inner parts, use `trigger-class`, `popup-class` (the menu
and each submenu) and `item-class` (every item). One item also takes its own
`class`. See [classes on the inner parts](/ui/theming#classes-on-the-inner-parts).
To fit your own layers above or below it, see [stacking](/ui/theming#stacking).

<<< ../../packages/ui/src/app/app-menu.css

## API Reference

### AppMenu

::: api app/AppMenu
:::

### AppMenuItems

::: api app/AppMenuItems
:::
