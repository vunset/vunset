# Drag

A list the user can reorder, by dragging or with the keyboard. You get the
new order back through `v-model`.

::: preview drag/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { DragRoot, DragItem, DragHandle } from '@vunset/vue';
</script>

<template>
  <DragRoot v-model="items">
    <DragItem v-for="item in items" :key="item.id" :value="item">
      <DragHandle />
    </DragItem>
  </DragRoot>
</template>
```

Each `DragItem` stands for one entry of the list, matched by its `value`.
Give it a `:key` too, since the list reorders. `DragHandle` is optional.

The root is a `role="list"`, and each item a `role="listitem"`.

## Examples

### With a handle

With `handle`, only the `DragHandle` starts a drag, and it's the item's tab
stop. The rest of the item behaves normally: it scrolls on touch, and the
controls in it work as usual.

::: preview drag/Handle
:::

### Horizontal

`orientation="horizontal"` lays the list out in a row. Dragging follows the
pointer sideways, and the keyboard moves items with the left and right
arrows.

::: preview drag/Horizontal
:::

### Grid

`orientation="grid"` is for a list laid out in rows that wrap: CSS grid,
`flex-wrap`, or columns that change with the width. It's still one ordered
list. The item follows the pointer on both axes and lands in the slot nearest
it, and the others slide along the order into the slot beside them, round the
row breaks.

::: preview drag/Grid
:::

### A disabled item

A disabled `DragItem` can't be picked up, but the others can still move past
it. `disabled` on the root locks the whole list.

::: preview drag/Disabled
:::

### Many tiles

Forty tiles in a dense grid. The rows are counted from the layout, so resize
the window and the arrows still move a whole row.

::: preview drag/ManyTiles
:::

## Dragging

- A press only becomes a drag once the pointer has moved `threshold` pixels
  (4), so a click on an item is still a click. Without `handle`, pressing a
  button, link or field inside an item doesn't start a drag.
- The item follows the pointer, and the others slide out of the way. Nothing
  changes in your list until the user lets go. Escape, or a canceled
  pointer, puts everything back.
- While dragging, the root has `data-sorting` and the dragged item
  `data-dragging`. Add a `transition` on `transform` to the items to make the
  others slide smoothly.
- The library moves items with an inline `transform`, so a `transform` of
  your own on an item gets overridden. Put it on an element inside instead.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Space</kbd>, <kbd>Enter</kbd> | Picks up the focused item, or puts it down. |
| <kbd>↓</kbd> <kbd>↑</kbd> (or <kbd>→</kbd> <kbd>←</kbd> across) | Moves the picked-up item one place. |
| <kbd>→</kbd> <kbd>←</kbd> in a grid | Moves it one place in the order, onto the next row at a row's end. |
| <kbd>↓</kbd> <kbd>↑</kbd> in a grid | Moves it a whole row. Down from a column the last row doesn't reach goes to the last place. |
| <kbd>Escape</kbd> | Puts the item down and the list back as it was. |

Moving focus away from a picked-up item puts it down where it is.

The moves aren't announced to screen readers. If that matters to you, say
what happened in a live region of your own, from the `change` event.

## API Reference

### DragRoot

The element carries `data-part="drag"` and `role="list"`.

::: api drag/DragRoot
:::

### DragItem

The element carries `data-part="drag-item"` and `role="listitem"`.

::: api drag/DragItem
:::

### DragHandle

Labeled "Reorder".

The element carries `data-part="drag-handle"`.

::: api drag/DragHandle
:::
