# FormRadioGroup

A set of radio buttons under one label, where you pick exactly one. Pass
`options`, or put `FormRadio`s inside it. It's built on [Radio](/forms/radio).

::: preview ui/form-radio/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormRadioGroup, FormRadio } from '@vunset/ui';

const plan = ref('free');
</script>

<template>
  <FormRadioGroup v-model="plan" label="Plan" :options="['free', 'pro']" />

  <FormRadioGroup v-model="plan" label="Plan">
    <FormRadio value="free" label="Free" />
    <FormRadio value="pro" label="Pro" />
  </FormRadioGroup>
</template>
```

An option can be a plain value, which is also its label, or an object with
`value`, `label`, `help` and `disabled`. Any other fields you add are passed
to the `#option` slot, so you can render them.

## Examples

### Children

Put `FormRadio`s inside instead of passing `options`, when each one needs its
own label and help. `class` and `style` on a `FormRadio` go on its row; other
attributes go on the radio itself. A `FormRadio` only works inside a group;
on its own it renders nothing.

::: preview ui/form-radio/Children
:::

### Horizontal

`orientation="horizontal"` lays the radios out in a row.

::: preview ui/form-radio/Horizontal
:::

### Option slot

The `#option` slot renders each option's label, and gets the whole option, so
you can show more than its `label`.

::: preview ui/form-radio/OptionSlot
:::

### Validation

`error` shows a message under the set and marks it invalid. `required` marks
the set and tells screen readers a choice is needed; the browser doesn't
enforce it, so the check is up to you.

### Read-only

A read-only group can still be focused, but the choice can't be changed.

::: preview ui/form-radio/ReadOnly
:::

### Disabled

`disabled` grays out every radio and takes the group out of the form.

::: preview ui/form-radio/Disabled
:::

## Keyboard

The whole group is one stop for <kbd>Tab</kbd>: it lands on the checked
radio, or on the first enabled one if none is checked.

| Key | Does |
| --- | --- |
| <kbd>↓</kbd> <kbd>→</kbd> / <kbd>↑</kbd> <kbd>←</kbd> | Next or previous radio, checking it, wrapping at the ends unless `loop` is off |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last radio, checking it |
| <kbd>Space</kbd> <kbd>Enter</kbd> | Check the focused radio |

## Styling

| Class | On |
| --- | --- |
| `form-radio-group` | The radios' container, with `data-orientation` |
| `form-radio` | One radio with its label and help |
| `form-radio-control` | The circle: a [RadioRoot](/forms/radio), with its `data-*` state |
| `form-radio-indicator` | The dot inside it |

The set's layout is shared with `FormCheckboxGroup` and lives in
`form-field.css`. The field around them uses the [FormField](/ui/form-field)
classes.

To add your own classes inside, use `control-class` (the container of
radios), `label-class`, `help-class` and `error-class`. A `FormRadio` takes
`label-class` and `help-class` for its own label and help. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-radio.css

## API Reference

### FormRadioGroup

::: api form/FormRadioGroup
:::

### FormRadio

::: api form/FormRadio
:::
