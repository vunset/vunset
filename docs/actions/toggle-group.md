# Toggle group

Buttons that stay pressed. Use a group for one choice, like text alignment,
or for several, like bold and italic. A `Toggle` also works on its own.

::: preview toggle-group/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { ToggleGroup, Toggle } from '@vunset/vue';
</script>

<template>
  <ToggleGroup>
    <Toggle value="a" />
  </ToggleGroup>
</template>
```

Inside a group, each `Toggle` needs a `value`. On its own it doesn't, and it
keeps track of whether it's pressed by itself.

## Examples

### A single toggle

On its own, a `Toggle` is a button you can press and release. Bind
`v-model` to a boolean to know whether it's pressed.

::: preview toggle-group/Single
:::

### Multiple

With `multiple`, any number can be pressed, and `v-model` is an array of
their values. Give toggles that show only an icon or a letter an
`aria-label`, so screen readers can name them.

::: preview toggle-group/Multiple
:::

### Required

`required` keeps one toggle pressed: pressing the last one again does
nothing. That makes the group a choice between options, like a segmented
control. If the group starts with nothing pressed and you don't bind
`v-model`, the first toggle is pressed for you.

::: preview toggle-group/Required
:::

### Vertical

`orientation="vertical"` is for toggles stacked in a column: the Up and Down
arrows move between them instead of Left and Right.

::: preview toggle-group/Vertical
:::

### Forms

Give the group a `name` and it submits one hidden input per pressed toggle,
with the toggle's value.

Inside a [Field](/forms/field), the group is the field's control. The field's
label names it (give the `FieldLabel` `as="div"`, since there's no single
input to point at), its messages describe it, and it takes the field's
`name`, disabled and invalid state. `invalid` puts `data-invalid` on the
group and on every toggle.

A field's `required` is only announced, as `aria-required` and
`data-required`. It doesn't press anything. The group's own `required`,
above, is what keeps one toggle pressed. Toggles have no read-only state.

## Keyboard

The whole group is one stop when you tab through the page. It lands on the
pressed toggle, or the first one, and after that on the toggle you used
last. The arrows wrap around at the ends, except
inside a [toolbar](/layout/group), where they move on to the toolbar's other
controls. Set `loop` to change that.

| Key                               | Does                                           |
| --------------------------------- | ---------------------------------------------- |
| <kbd>←</kbd> <kbd>→</kbd>         | Previous or next toggle, in a horizontal group |
| <kbd>↑</kbd> <kbd>↓</kbd>         | Previous or next toggle, in a vertical group   |
| <kbd>Home</kbd> <kbd>End</kbd>    | First or last toggle                           |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Press or release the focused toggle            |

## API Reference

### ToggleGroup

Name the group with `aria-label` or `aria-labelledby`.

The element carries `data-part="toggle-group"`, `role="group"`,
`data-orientation`, and `data-disabled`, `data-invalid`, `data-required` and
`data-multiple` when they apply.

::: api toggle/ToggleGroup
:::

### Toggle

The element carries `data-part="toggle"`, `aria-pressed`, `data-pressed` or
`data-unpressed`, and `data-disabled` and `data-invalid` when they apply.

::: api toggle/Toggle
:::
