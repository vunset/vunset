# Number field

A text input for a number, with buttons and keys to step it. The value is a
`number` or `null`; what's shown is formatted for its locale, and read back
from it as you type.

::: preview number-field/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from '@vunset/vue';
</script>

<template>
  <NumberFieldRoot v-model="quantity">
    <NumberFieldDecrement />
    <NumberFieldInput />
    <NumberFieldIncrement />
  </NumberFieldRoot>
</template>
```

- `v-model` is written as you type, whenever the text reads as a number. On
  blur or Enter, the value is clamped to `min` and `max` and the text
  reformatted; text that isn't a number goes back.
- ArrowUp and ArrowDown step by `step`; Shift, PageUp and PageDown by
  `large-step`; Home and End go to `min` and `max`. A step lands on the grid
  of `step` counted from `min`.
- Holding a button repeats it. The buttons stay out of the tab order, keep
  focus in the input, and turn off at their end of the range.

## Examples

### Format and locale

`format` takes `Intl.NumberFormat` options, and `locale` the language. Typing
reads the same way back: German's `1.234,5`, a currency sign, a percent. A
percent's value is the fraction, `0.15` for `15%`. `wheel` lets the mouse wheel
step it while it has focus.

::: preview number-field/Format
:::

### In a field

Inside a [Field](/forms/field) it takes the field's label, messages and state.
The input shows formatted text, so the field's `name` goes on a hidden input
submitting the plain number.

```vue
<FieldRoot name="quantity">
  <FieldLabel>Quantity</FieldLabel>
  <NumberFieldRoot :min="1">
    <NumberFieldInput />
  </NumberFieldRoot>
</FieldRoot>
```

## Accessibility

The input is a `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`,
`aria-valuemax` and the formatted value as `aria-valuetext`. The buttons are
labeled `Increase` and `Decrease`; give them an `aria-label` of your own to
translate them.

## API Reference

### NumberFieldRoot

The element carries `data-part="number-field"`, and `data-filled`,
`data-focused`, `data-invalid`, `data-disabled`, `data-readonly` and
`data-required`.

::: api number-field/NumberFieldRoot
:::

### NumberFieldInput

The element carries `data-part="input"`, the root's state, and
`role="spinbutton"`.

::: api number-field/NumberFieldInput
:::

### NumberFieldIncrement

The element carries `data-part="increment"`, and `data-disabled` at the top
of the range.

::: api number-field/NumberFieldIncrement
:::

### NumberFieldDecrement

The element carries `data-part="decrement"`, and `data-disabled` at the
bottom of the range.

::: api number-field/NumberFieldDecrement
:::
