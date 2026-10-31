# Drawer

A [Dialog](/overlays/dialog) that slides in from an edge of the screen and
can be swiped away. It handles focus, modality and stacking the same way a
dialog does.

One difference: a click outside closes a drawer by default. Set
`:outside-press="false"` to turn that off.

::: preview drawer/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  DrawerRoot,
  DrawerTrigger,
  Portal,
  DrawerBackdrop,
  Popup,
  DrawerHandle,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from '@vunset/vue';
</script>

<template>
  <DrawerRoot>
    <DrawerTrigger />
    <Portal>
      <DrawerBackdrop />
      <Popup>
        <DrawerHandle />
        <DrawerTitle />
        <DrawerDescription />
        <DrawerClose />
      </Popup>
    </Portal>
  </DrawerRoot>
</template>
```

The popup and the backdrop carry `data-side`. Slide the popup in and out with
`data-enter-from` and `data-leave-to`. While you drag it, it gets
`data-dragging`, and its position is set inline with a `transform` and
transitions turned off, so your own `transform` on the popup is overridden
during a drag.

## Examples

### Side

`side` picks the edge: `bottom`, `top`, `left` or `right`. You dismiss it by
swiping towards that edge.

::: preview drawer/Side
:::

### Swipe from anywhere

With `swipeable` set to `true`, you can drag the whole drawer, not just the
handle. A press only turns into a drag once it moves a few pixels, so tapping
a button inside is still a click, and pressing in a text field never drags.

::: preview drawer/Anywhere
:::

## Swiping

Drag the `DrawerHandle` towards the drawer's edge and let go. The drawer
closes if you've dragged it past `dismiss-threshold` of its size (40% by
default), or flicked it faster than `velocity-threshold`. Otherwise it springs
back. Dragging the other way meets resistance.

`swipeable` is `'handle'` by default. `true` makes the whole drawer draggable,
and `false` turns swiping off.

On a touch screen, a drawer you can drag from anywhere takes over touch moves
along its axis. Content inside can still scroll the other way, but not along
the axis. A bottom drawer can't scroll its content up and down, for example.
If the drawer holds a long list, keep swiping to the handle.

## Keyboard

The same as a [Dialog's](/overlays/dialog#keyboard):

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> <kbd>Space</kbd> | On the trigger: open, with focus on the first thing in the drawer |
| <kbd>Tab</kbd> | Move through the drawer; while modal, focus stays inside |
| <kbd>Esc</kbd> | Close the drawer in front, back to what opened it |

## API Reference

### DrawerRoot

It renders no element. The trigger, the backdrop and the popup carry its
state.

::: api drawer/DrawerRoot
:::

### DrawerHandle

The element carries `data-part="handle"`. It's the area you drag the drawer
by, unless swiping is off. With `swipeable` set to `true` on the root, the
rest of the drawer can be dragged too.

::: api drawer/DrawerHandle
:::

### DrawerTrigger, DrawerBackdrop, DrawerTitle, DrawerDescription, DrawerClose

The [Dialog's](/overlays/dialog#api-reference) parts, exported under the
drawer's names, with the same props and `data-part` values. The backdrop
carries the drawer's state, `data-side` included. The trigger carries the
dialog's state, without `data-side`, and the title, description and close
button carry only their `data-part`.
