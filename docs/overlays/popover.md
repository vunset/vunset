# Popover

A small dialog anchored to a button: a title, some content, perhaps a form.
Focus moves into it when it opens and back to the trigger when it closes.
Escape or a click outside closes it.

::: preview popover/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  Portal,
  Positioner,
  Popup,
  PopoverArrow,
  PopoverTitle,
  PopoverDescription,
  PopoverClose
} from '@vunset/vue';
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger />
    <Portal>
      <Positioner>
        <Popup>
          <PopoverArrow />
          <PopoverTitle />
          <PopoverDescription />
          <PopoverClose />
        </Popup>
      </Positioner>
    </Portal>
  </PopoverRoot>
</template>
```

`Portal`, `Positioner` and `Popup` are shared with every overlay, documented
under [Overlay parts](/utilities/overlay). Here the popup is a `role="dialog"`,
named by `PopoverTitle` and described by `PopoverDescription`.

## Examples

### Side and align

`side` picks the edge of the trigger it opens on (`bottom` by default), and
`align` lines it up along that edge: `start`, `center` or `end`. When there's
no room, it flips to the other side. `side-offset` sets the gap.

::: preview popover/Placement
:::

### A form inside

Focus goes to the first thing that takes it, here the input. `v-model:open`
lets the form close the popover when it submits.

::: preview popover/Form
:::

### Open on hover

`open-on-hover` also opens it once a mouse rests on the trigger for `delay`
(200ms), and closes it `close-delay` (150ms) after the mouse leaves both the
trigger and the popover, time enough to cross to it. A tap still opens it, and
pressing the trigger keeps it open. Opened by the mouse, it leaves focus where
it was.

::: preview popover/Hover
:::

### Modal

`modal` keeps focus inside, locks the page's scroll and makes the rest of the
page inert until it closes. `modal="trap-focus"` only keeps focus inside.

::: preview popover/Modal
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> <kbd>Space</kbd> | On the trigger: open or close |
| <kbd>Tab</kbd> | Move through the popover; with `modal`, focus stays inside |
| <kbd>Esc</kbd> | Close, back to the trigger |

## API Reference

### PopoverRoot

It renders no element. The trigger and the popup carry its state.

::: api popover/PopoverRoot
:::

### PopoverTrigger

The element carries `data-part="trigger"`, `aria-haspopup="dialog"`,
`aria-expanded` and `aria-controls`.

::: api popover/PopoverTrigger
:::

### PopoverTitle

The element carries `data-part="title"`.

::: api popover/PopoverTitle
:::

### PopoverDescription

The element carries `data-part="description"`.

::: api popover/PopoverDescription
:::

### PopoverClose

The element carries `data-part="close"`.

::: api popover/PopoverClose
:::

### PopoverArrow

The element carries `data-part="arrow"`. It's positioned for you, on the side
the popover ended up on.

::: api popover/PopoverArrow
:::
