# Tooltip

A short label that shows when the pointer rests on a control, or when the
control gets keyboard focus. Screen readers read it as the control's
description. Never put anything interactive in it; use a
[Popover](/overlays/popover) for that.

::: preview tooltip/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { TooltipGroup, TooltipRoot, TooltipTrigger, Portal, Positioner, Popup, TooltipArrow } from '@vunset/vue';
</script>

<template>
  <TooltipGroup>
    <TooltipRoot>
      <TooltipTrigger />
      <Portal>
        <Positioner>
          <Popup>
            <TooltipArrow />
          </Popup>
        </Positioner>
      </Portal>
    </TooltipRoot>
  </TooltipGroup>
</template>
```

`TooltipGroup` is optional. `Portal`, `Positioner` and `Popup` are shared
with the other overlays and documented under [Overlay parts](/utilities/overlay).
Here the popup gets `role="tooltip"`.

## Examples

### A group of their own

A pointer just passing over the page shouldn't flash tooltips everywhere, so
the first tooltip waits for its `delay`. Once one is showing, the user is
clearly reading them, so its neighbors open at once. That lasts until
`timeout` ms (400 by default) after the last one closes.

Tooltips do this across your whole app even without a `TooltipGroup`. Wrap some in
a `TooltipGroup` to make them a group of their own, with its own timings.

::: preview tooltip/Group
:::

### Side

`side` picks where it opens. It flips to the other side when there's no room.

::: preview tooltip/Side
:::

### Arrow

`TooltipArrow` is positioned for you, on the side the tooltip ended up on. It
carries that side as `data-side`, so you can rotate or border it to match.
Here `side-offset` widens the gap to make room for it.

::: preview tooltip/Arrow
:::

### Hoverable

By default you can move the pointer from the trigger onto the tooltip and stay
there, to read or select its text. The tooltip waits at least 100ms before
closing, so the pointer has time to cross the gap. A longer `close-delay`
gives it more. With `:hoverable="false"` it closes as soon as the pointer
leaves the trigger.

::: preview tooltip/Hoverable
:::

### Your own element as the trigger

With `as="child"`, the trigger renders no element of its own. The one element
or component in its slot becomes the trigger, and gets the trigger's
attributes and handlers. Where they clash, the child's own props win, and its
own handlers run first. Every part in the library takes `as="child"`, not only
this one.

```vue
<template>
  <TooltipRoot>
    <TooltipTrigger as="child">
      <MyButton @click="save">Save</MyButton>
    </TooltipTrigger>
    <!-- … -->
  </TooltipRoot>
</template>
```

A component used this way has to pass its attributes on to its root element.
Vue components do that by default, unless they set `inheritAttrs: false`.

## Behavior

- The pointer opens it after `delay` (600ms by default) and closes it after
  `close-delay` (0 by default, but at least 100ms while it's hoverable). It
  stays open while the pointer is over the tooltip itself, unless `hoverable`
  is off.
- Keyboard focus on the trigger opens it at once, and moving focus away
  closes it.
- Escape, or pressing the trigger, closes it.
- Touch doesn't open it. There's no hover on touch, and a tap is a press.

## API Reference

### TooltipGroup

Makes the tooltips inside it a group with its own timings. It renders no
element.

::: api tooltip/TooltipGroup
:::

### TooltipRoot

It renders no element. The trigger and the popup carry its state.

::: api tooltip/TooltipRoot
:::

### TooltipTrigger

The element carries `data-part="trigger"`, and `aria-describedby` pointing at
the tooltip while it's shown.

::: api tooltip/TooltipTrigger
:::

### TooltipArrow

The element carries `data-part="arrow"` and `data-side`.

::: api tooltip/TooltipArrow
:::
