# FormRange

A slider with its label, help text and error message. Use one thumb to pick
a number, or two to pick a range. The current value shows next to the label.
It's built on [Range](/forms/range).

No label? Give it an `aria-label`, and it goes on the slider itself.

::: preview ui/form-range/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormRange } from '@vunset/ui';

const volume = ref(40);
const price = ref([200, 800]);
</script>

<template>
  <FormRange v-model="volume" label="Volume" />
  <FormRange v-model="price" label="Price" :max="1000" />
</template>
```

Bind a number and you get one thumb. Bind an array and you get one thumb per
entry. Whichever you start with, `v-model` keeps that shape.

`v-model` updates on every move while you drag. To save only once the user
lets go, listen to `@commit` instead: it fires when a drag or a key press
ends on a new value.

By default the thumbs stay inside the track at either end
(`thumb-alignment="edge"`). With `center`, the middle of a thumb reaches the
very end instead.

## Examples

### Two thumbs

Screen readers announce each thumb with the label, as the start or the end
of the range. To name them yourself, pass `thumb-labels`.

`min-steps-between-values` keeps the thumbs apart. When you drag one into the
other, it pushes the other along; `thumb-collision-behavior` changes that.

::: preview ui/form-range/TwoThumbs
:::

### Format

`format` takes `Intl.NumberFormat` options and applies them to the value
shown and the one screen readers announce. For full control, render the value
yourself in the `#value` slot, which gets `formattedValues`. To hide it, use
`:show-value="false"`.

::: preview ui/form-range/Format
:::

### Validation

`error` shows a message under the slider and colors it as invalid.

::: preview ui/form-range/Validation
:::

### Vertical

`orientation="vertical"` runs from bottom to top, 10rem tall by default.

::: preview ui/form-range/Vertical
:::

### Disabled

`disabled` grays the slider out and takes it out of the form.

::: preview ui/form-range/Disabled
:::

## Keyboard

On a focused thumb:

| Key                                     | Moves by                                           |
| --------------------------------------- | -------------------------------------------------- |
| <kbd>→</kbd> <kbd>↑</kbd>               | `+step`, or `+large-step` with <kbd>Shift</kbd>    |
| <kbd>←</kbd> <kbd>↓</kbd>               | `−step`, or `−large-step` with <kbd>Shift</kbd>    |
| <kbd>Page Up</kbd> <kbd>Page Down</kbd> | `±large-step`                                      |
| <kbd>Home</kbd> <kbd>End</kbd>          | To the lowest or highest value this thumb may take |

On a right-to-left page the horizontal arrows swap, so each arrow still moves
the thumb the way it points. A thumb can't pass its neighbors. Each key press
changes the value and fires `@commit` straight away.

## Styling

| Class | On |
| --- | --- |
| `form-range` | The root, with `data-orientation` and its `data-*` state |
| `form-range-header` | The label and the value, in one row; the value wraps under a long label |
| `form-label` | The label, drawn by the range rather than the field, so it shares the row |
| `form-range-value` | The value, at the end of the row |
| `form-range-control` | The area a press lands on, a thumb's height |
| `form-range-track` | The track |
| `form-range-indicator` | The filled part of the track |
| `form-range-thumb` | Each thumb, with `data-focused`, `data-focus-visible` and `data-index` |

The track and thumb sizes are `--ui-range-track` and `--ui-range-thumb`, set
on `.form-range`. The [Range](/forms/range) page lists every part's `data-*`
state. The field around it uses the [FormField](/ui/form-field) classes.

To add your own classes inside, use `control-class` (the track and its
thumbs), `label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-range.css

## API Reference

### FormRange

::: api form/FormRange
:::
