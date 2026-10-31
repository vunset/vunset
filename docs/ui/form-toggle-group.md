# FormToggleGroup

A row of buttons in one track where you press one, or several with
`multiple`. Also known as a segmented control. It comes with a label, help
text and an error message, and is built on [ToggleGroup](/actions/toggle-group).

::: preview ui/form-toggle-group/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const view = ref<ToggleGroupValue>('grid');
</script>

<template>
  <FormToggleGroup v-model="view" label="View" :options="['list', 'grid']" />
</template>
```

`v-model` holds the pressed value, or `null` when nothing is pressed. With
`multiple`, it's an array.

An option can be a plain value, which is also its label, or an object with
`value`, `label` and `disabled`. If your objects use other field names, like
`{ code, name }`, point at them with `value-key` and `label-key`.

To render an option your own way, use the `#option` slot. It gets the whole
option, typed like your options, so `#option="{ label, hint }"` works.

You can also skip `options` and put `Toggle`s with `class="form-toggle"`
inside:

```vue
<script setup lang="ts">
import { Toggle } from '@vunset/vue';
import { FormToggleGroup } from '@vunset/ui';
</script>

<template>
  <FormToggleGroup v-model="view" label="View">
    <Toggle value="list" class="form-toggle">List</Toggle>
    <Toggle value="grid" class="form-toggle">Grid</Toggle>
  </FormToggleGroup>
</template>
```

Give it a `name`, and a form submits the value of each pressed toggle.

## Examples

### Multiple

With `multiple`, any number of toggles can be pressed, and `v-model` is an
array.

::: preview ui/form-toggle-group/Multiple
:::

### Lowercase

`v-model.lowercase` writes each option's value in lowercase, while the label
stays as written. So `['S', 'M']` shows `S` and `M`, but your model and the
form get `s` and `m`. Start your model with lowercase values to match.
`Toggle`s you put inside keep the values you give them.

::: preview ui/form-toggle-group/Lowercase
:::

### Keep one

With `keep-one`, one toggle always stays pressed: you can't release the last
one, and an empty group presses its first. Use it when the group is a choice
between options rather than a set of on/off switches.

::: preview ui/form-toggle-group/KeepOne
:::

### Validation

`required` adds an asterisk and tells screen readers a choice is needed. The
browser doesn't enforce it, and it doesn't press anything for the user.
`error` shows a message under the toggles and marks them invalid.

::: preview ui/form-toggle-group/Validation
:::

### Vertical

`orientation="vertical"` stacks the toggles in a column.

::: preview ui/form-toggle-group/Vertical
:::

### Start and end

The `#start` and `#end` slots put something inside the group's box, before or
after the toggles: an icon, a caption, a unit. They aren't toggles, so the
arrow keys skip them.

::: preview ui/form-toggle-group/Addons
:::

### Disabled

`disabled` grays out every toggle. There's no read-only mode, because a
toggle has no read-only state that screen readers can announce.

::: preview ui/form-toggle-group/Disabled
:::

## Keyboard

The whole group is one stop for <kbd>Tab</kbd>: it lands on the pressed
toggle, or on the first one if none is pressed. The arrow keys wrap around at
the ends.

| Key                               | Does                                           |
| --------------------------------- | ---------------------------------------------- |
| <kbd>←</kbd> <kbd>→</kbd>         | Previous or next toggle, in a horizontal group |
| <kbd>↑</kbd> <kbd>↓</kbd>         | Previous or next toggle, in a vertical group   |
| <kbd>Home</kbd> <kbd>End</kbd>    | First or last toggle                           |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Press or release the focused toggle            |

## Styling

| Class | On |
| --- | --- |
| `form-toggle-group` | The track, with `data-orientation` and its `data-*` state |
| `form-toggle` | Each toggle, with `data-pressed` and `data-invalid` |
| `form-toggle-group-addon` | `#start` and `#end`, with `data-side`; `form-addon` too |

The field around it uses the [FormField](/ui/form-field) classes.

To add your own classes inside, use `control-class` (the track),
`label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-toggle-group.css

## API Reference

### FormToggleGroup

::: api form/FormToggleGroup
:::
