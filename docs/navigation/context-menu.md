# Context menu

A menu that opens where the pointer is, in place of the browser's own. You
open it with a right-click, or with a long press on a touch screen. Inside, it
takes the same parts as a [Menu](/navigation/menu).

While it's open, the page doesn't scroll. The menu sits where you clicked, so
it would otherwise end up over the wrong content.

::: preview context-menu/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { ContextMenuRoot, ContextMenuTrigger, Portal, Positioner, Popup, MenuItem } from '@vunset/vue';
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger />
    <Portal>
      <Positioner>
        <Popup>
          <MenuItem />
        </Popup>
      </Positioner>
    </Portal>
  </ContextMenuRoot>
</template>
```

## Examples

### Items and submenus

Checkbox and radio items, groups, separators and submenus all work as they do
in a [Menu](/navigation/menu).

::: preview context-menu/Items
:::

### One menu for a list

One context menu can serve a whole list. Remember which row was pressed in
that row's `pointerdown` handler, then let the items act on that row.
`pointerdown` fires before the menu opens, for a right-click and a long press
alike.

::: preview context-menu/Rows
:::

## Keyboard

Opening moves focus to the first item, because the area you pressed is
rarely focusable itself. From there every key works as in a
[Menu](/navigation/menu#keyboard). Escape closes it, and focus goes back to
whatever had it before the menu opened. The same happens after you choose an
item.

## API Reference

### ContextMenuRoot

::: api context-menu/ContextMenuRoot
:::

### ContextMenuTrigger

The area where a right-click or a long press opens the menu. A long press
takes 500ms by default (`long-press-delay`). If a touch moves more than a few
pixels before then, it counts as a scroll, not a press.

The element carries `data-part="context-menu-trigger"`.

::: api context-menu/ContextMenuTrigger
:::
