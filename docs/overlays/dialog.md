# Dialog

A window over the page that keeps focus until it closes. It's modal by
default: the page behind can't be scrolled or reached, and focus goes back to
the trigger when it closes. Dialogs opened from inside one another stack.

A click outside doesn't close a dialog unless you set `outside-press`. That's
the opposite of [Drawer](/overlays/drawer) and [Popover](/overlays/popover),
which close on an outside click by default.

::: preview dialog/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  Portal,
  DialogBackdrop,
  Popup,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@vunset/vue';
</script>

<template>
  <DialogRoot>
    <DialogTrigger />
    <Portal>
      <DialogBackdrop />
      <Popup>
        <DialogTitle />
        <DialogDescription />
        <DialogClose />
      </Popup>
    </Portal>
  </DialogRoot>
</template>
```

A dialog isn't anchored to anything, so there's no `Positioner`. Place the
popup yourself, usually `position: fixed` in the middle of the viewport.
`Portal` and `Popup` are shared with the other overlays and documented under
[Overlay parts](/utilities/overlay). Here the popup gets `role="dialog"`,
named by `DialogTitle` and described by `DialogDescription`.

## Examples

### Alert dialog

Use `role="alertdialog"` for a question the user has to answer. It's always
modal, and an outside click never closes it, even with `outside-press` set.
Escape still does. Put `autofocus` on the safe answer so focus starts there
instead of on the first thing in the dialog.

::: preview dialog/Alert
:::

### Nested dialogs

A dialog opened from inside another stacks on top of it, and Escape closes
only the one in front. To make the ones behind step back, style them by:

- `data-nested`: another dialog is open on top of this one.
- `--dialog-level` on the backdrop and popup: how many dialogs are on top of
  this one, `0` for the one in front. `data-level` carries the same number
  when it's above 0.

`DialogClose close-all` closes the whole stack.

::: preview dialog/Nested
:::

### Three levels deep

Three stacked dialogs, the first with `outside-press`. A click on its backdrop
closes that level only, and Escape closes the one in front. The `close-all`
button in the innermost one closes all three.

::: preview dialog/ThreeLevels
:::

### One dialog for many rows

A table needs one dialog, not one per row. Each row's button sets what to
edit and opens the dialog through `v-model:open`, so there's no
`DialogTrigger`.

::: preview dialog/OneForManyRows
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> <kbd>Space</kbd> | On the trigger: open, with focus on the first thing in the dialog |
| <kbd>Tab</kbd> | Move through the dialog; while modal, focus stays inside |
| <kbd>Esc</kbd> | Close the dialog in front, back to what opened it |

## API Reference

### DialogRoot

It renders no element. The trigger, the backdrop and the popup carry its
state. It emits `closed` once the dialog has closed and its exit animation
has finished, which is the moment to clear what it was showing.

::: api dialog/DialogRoot
:::

### DialogTrigger

The element carries `data-part="trigger"`, `aria-haspopup="dialog"`,
`aria-expanded` and `aria-controls`.

::: api dialog/DialogTrigger
:::

### DialogBackdrop

The element carries `data-part="backdrop"` and `--dialog-level`. It's hidden
from screen readers, and stays in the DOM as long as the dialog does,
through its exit animation.

::: api dialog/DialogBackdrop
:::

### DialogTitle

The element carries `data-part="title"`.

::: api dialog/DialogTitle
:::

### DialogDescription

The element carries `data-part="description"`.

::: api dialog/DialogDescription
:::

### DialogClose

The element carries `data-part="close"`.

::: api dialog/DialogClose
:::
