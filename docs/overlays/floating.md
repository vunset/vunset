# Floating

A panel that floats over the page, like an inspector or a notes window. You
drag it by its header and, if you allow it, resize it from its edges. It isn't
modal, and it stays inside the viewport.

There's no trigger part. Open and close it with `v-model:open`, from any
button of your own, or start it open with `default-open`.

::: preview floating/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { FloatingRoot, Portal, Popup, FloatingHeader, FloatingTitle, FloatingClose, FloatingResizer } from '@vunset/vue';
</script>

<template>
  <FloatingRoot v-slot="{ handles }">
    <Portal>
      <Popup>
        <FloatingHeader>
          <FloatingTitle />
          <FloatingClose />
        </FloatingHeader>
        <FloatingResizer v-for="handle in handles" :key="handle" :value="handle" />
      </Popup>
    </Portal>
  </FloatingRoot>
</template>
```

A floating panel isn't anchored to anything, so there's no `Positioner`.
`Portal` and `Popup` are documented under [Overlay parts](/utilities/overlay).
The popup is positioned for you, with `position: fixed` and a `transform`.
With a `FloatingTitle` inside, the popup is a `role="dialog"` named by it.

## Examples

### Anchored to an edge

`left`, `right`, `top` and `bottom` place the panel a set distance from the
viewport's edges. It keeps those distances when the window resizes, until you
drag it somewhere else.

::: preview floating/Anchored
:::

### Resizing and bounds

Switch `resize` between its modes and turn `bounding` on and off to see what
they do. The body is a `ScrollArea` that fills the panel as you resize it.
`@drag` and `@resize` report every move.

::: preview floating/ResizeAndBounding
:::

## Moving and resizing

- Drag the `FloatingHeader` to move the panel. Buttons and fields in the
  header still work as usual. Double-click the header to put the panel back
  where it opened.
- `resize` decides which edges you can pull: `'none'` (the default, no
  handles), `'x'`, `'y'` or `'both'`. `FloatingRoot`'s slot gives you the
  matching `handles`; render one `FloatingResizer` for each. `min-width`,
  `min-height`, `max-width` and `max-height` limit the size.
- Until you pull an edge, the panel takes its content's size, capped at the
  room it has. With `bounding` (on by default) it stays inside the viewport.
- Moving and resizing are pointer-only. There's no keyboard way to do either,
  and Escape doesn't close the panel.

The popup carries `data-part="floating"` and these state attributes:

| Attribute | When |
| --- | --- |
| `data-open`, `data-closed` | Open or closed. |
| `data-resize` | Which edges can be pulled, unless `none`. |
| `data-dragging` | While the header is dragged. |
| `data-resizing` | While an edge is pulled. |
| `data-handle` | Which edge or corner is pulled (`n`, `se`, …), while resizing. |
| `data-moved` | Once it's been dragged from where it opened. |

## API Reference

### FloatingRoot

It renders no element. The popup carries its state.

::: api floating/FloatingRoot
:::

### FloatingHeader

The element carries `data-part="header"` and `touch-action: none`.

::: api floating/FloatingHeader
:::

### FloatingTitle

The element carries `data-part="title"`.

::: api floating/FloatingTitle
:::

### FloatingClose

The element carries `data-part="close"` and is labeled "Close".

::: api floating/FloatingClose
:::

### FloatingResizer

The element carries `data-part="resizer"` and `data-handle` with its edge or
corner. It's hidden from screen readers, since resizing is pointer-only.

::: api floating/FloatingResizer
:::
