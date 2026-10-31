# Range

A slider, with one thumb for a single value or several for a span. Each thumb
holds a hidden `<input type="range">`, so forms and screen readers see real
range inputs, and the state shows up as `data-*` attributes for styling.

::: preview range/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { RangeRoot, RangeLabel, RangeValue, RangeControl, RangeTrack, RangeIndicator, RangeThumb } from '@vunset/vue';
</script>

<template>
  <RangeRoot>
    <RangeLabel />
    <RangeValue />
    <RangeControl>
      <RangeTrack>
        <RangeIndicator />
        <RangeThumb />
      </RangeTrack>
    </RangeControl>
  </RangeRoot>
</template>
```

Render one `RangeThumb` per value. A value without a thumb isn't shown or
submitted. In a form, give the root a `name`: every thumb submits its value
under it.

## Examples

### Two thumbs

Give `v-model` an array to get one thumb per entry, with the indicator
between them. `min-steps-between-values` keeps the thumbs apart. Give each
thumb an `aria-label`, so screen readers can tell them apart.

::: preview range/TwoThumbs
:::

### Collisions

`thumb-collision-behavior` decides what happens when you drag a thumb into
its neighbor:

- `push` moves the neighbor along. Drag back and the neighbor follows, but
  no further than where it started.
- `swap` passes the drag to the neighbor.
- `none` stops the thumb where the neighbor is.

The keyboard never pushes.

::: preview range/Collisions
:::

### Format

`format` takes `Intl.NumberFormat` options. It's used by `RangeValue` and
for what screen readers announce. `large-step` is how far Shift with an
arrow, and Page Up or Page Down, move the thumb.

::: preview range/Format
:::

### Commit

`v-model` and `@change` update on every move of a drag. `@commit` fires once
the value settles, on release or after a key press, and only if it changed.
That's the moment to save. Its `details.reason` says how it changed: `drag`,
`track-press`, `keyboard` or `input-change`.

::: preview range/Commit
:::

### Edge alignment

`thumb-alignment="edge"` keeps the whole thumb inside the control, so at the
ends it sits flush with the edge instead of hanging half outside.

::: preview range/Edge
:::

### Vertical

`orientation="vertical"` runs from bottom to top. Give the control a height.

::: preview range/Vertical
:::

### Disabled

A disabled range can't be moved, and every part gets `data-disabled`.

::: preview range/Disabled
:::

## Keyboard

On a focused thumb:

| Key                                     | Moves by                                           |
| --------------------------------------- | -------------------------------------------------- |
| <kbd>→</kbd> <kbd>↑</kbd>               | `+step`, or `+large-step` with <kbd>Shift</kbd>    |
| <kbd>←</kbd> <kbd>↓</kbd>               | `−step`, or `−large-step` with <kbd>Shift</kbd>    |
| <kbd>Page Up</kbd> <kbd>Page Down</kbd> | `±large-step`                                      |
| <kbd>Home</kbd> <kbd>End</kbd>          | To the lowest or highest value this thumb may take |

On a right-to-left page the horizontal arrows swap, so an arrow always moves
the thumb the way it points. A thumb can't pass its neighbors, and each key
press changes and commits the value at once.

## API Reference

### RangeRoot

The element carries `data-part="root"` and `role="group"`, named by
`RangeLabel`. Inside a `FieldRoot`, the field's label points at a single thumb's
input.

::: api range/RangeRoot
:::

### RangeLabel

The element carries `data-part="label"`.

::: api range/RangeLabel
:::

### RangeValue

An `<output>` showing the formatted values, joined by ` – `.

The element carries `data-part="value"`.

::: api range/RangeValue
:::

### RangeControl

The area you can press. A press moves the nearest thumb there and focuses
it, and a drag continues until you let go, wherever the pointer is.

The element carries `data-part="control"`.

::: api range/RangeControl
:::

### RangeTrack

The element carries `data-part="track"`. It's positioned, so the indicator and
thumbs can be placed inside it.

::: api range/RangeTrack
:::

### RangeIndicator

The filled part of the track: from the start to the thumb, or between the
first and last thumbs.

The element carries `data-part="indicator"`. With `thumb-alignment="edge"` it
follows the thumbs through `--start-position` and `--relative-size`, and
stays hidden until they've been measured.

::: api range/RangeIndicator
:::

### RangeThumb

The element carries `data-part="thumb"` and its place as `data-index`, plus
`data-focused` while it's the active thumb and `data-focus-visible` while
that focus came from the keyboard. With `thumb-alignment="edge"` its place
is `--position`. Its hidden input has `data-part="thumb-input"`.

::: api range/RangeThumb
:::
