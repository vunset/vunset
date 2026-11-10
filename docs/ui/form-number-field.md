# FormNumberField

A number input with − and + buttons, its label, help text and error message.
It's built on [Field](/forms/field) and [Number field](/forms/number-field).

Attributes like `placeholder` or `aria-describedby` go on the `<input>`.

::: preview ui/form-number-field/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormNumberField } from '@vunset/ui';

const guests = ref<number | null>(2);
</script>

<template>
  <FormNumberField v-model="guests" label="Guests" :min="1" :max="12" />
</template>
```

The value is a `number`, or `null` when empty. It's written as you type, and
clamped to `min` and `max` once you leave the field.

## Examples

### Format

`format` takes `Intl.NumberFormat` options, and `locale` the language: a
currency, a percent (whose value is the fraction, `0.18` for `18%`), units.
`step` and `large-step` set how far the buttons, the arrow keys, and Shift or
PageUp/PageDown move it. `wheel` lets the mouse wheel step it while focused.

::: preview ui/form-number-field/Format
:::

### Without buttons

`:buttons="false"` leaves only the input; the keys still step it.

::: preview ui/form-number-field/NoButtons
:::

### States

`error`, `read-only`, `disabled` and `size` work as on every `Form*` field.

::: preview ui/form-number-field/States
:::

## Styling

| Class | On |
| --- | --- |
| `form-control` | The box's look, shared by every `Form*` field: [form-control.css](/ui/theming#the-field-box) |
| `form-number-field` | The box around the input and its buttons, with its `data-*` state |
| `form-number-field-input` | The `<input>` |
| `form-number-field-button` | The − and + buttons, with `data-disabled` at their end of the range |

The icons are `number-decrement` and `number-increment`, so an app icon of
that name replaces them. To add your own classes inside, use `control-class`
(the box), `input-class` (the `<input>`), `label-class`, `help-class` and
`error-class`.

<<< ../../packages/ui/src/form/form-number-field.css

## API Reference

### FormNumberField

::: api form/FormNumberField
:::
