# Input

A text input with its state as `data-*` attributes, and limits that apply
while you type rather than only on submit. Bind it with `v-model`, or let it
keep its own value starting from `default-value`. Inside a
[Field](/forms/field) it picks up the field's label, messages and state. On
its own it works as it is.

::: preview input/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { Input } from '@vunset/vue';
</script>

<template>
  <Input />
</template>
```

It renders an `<input>`. Native attributes like `placeholder`, `autocomplete`
and `inputmode` pass through.

To label it, give it an `id` and point a `<label>` at it, or put it in a
[Field](/forms/field), which connects the label, description and error
message for you.

`v-model.trim` and `v-model.number` work as on a plain `<input>`.
`v-model.optional` writes `undefined` instead of `''` when the input is
emptied, which is handy for filters.

`required` is announced to screen readers (`aria-required`) and marked with
`data-required`, but the browser won't block the form from submitting. Check
it in your own validation.

## Examples

### Number

`type="number"` gives you a text input that only accepts numbers as you
type. A `min` of zero or more also stops a minus sign.

A number outside `min` and `max`, or off its `step` (counted from `min`),
marks the input invalid with `data-invalid` and `aria-invalid`. A
`FieldGroup` around it turns invalid too. The field, its label and its
`FieldError` don't: those still follow your own validation.

::: preview input/Number
:::

### Negative and decimal

A negative `min` allows a leading minus. One decimal point is always
allowed, whatever the `step`.

::: preview input/Signed
:::

### Filter

`filter` decides what can be typed at all, checked on every keystroke and
paste. Pass a regular expression as a string; it's matched against the whole
value. `max-length` works the same way: a paste that would go past it is
ignored.

::: preview input/Filter
:::

### Transform

`transform` rewrites the text once it's committed: when the input loses focus,
or on Enter. While typing, the text stays as typed, so the caret never jumps.
It runs on what the user typed, not on a value the app sets through `v-model`.
`toSeparatedList` from [`@vunset/utils`](/helpers/strings) tidies a list kept
in one string.

::: preview input/Transform
:::

## API Reference

### Input

::: api input/Input
:::

Through a template ref you get its `value` ref and `focus()`.

The element carries `data-part="input"`, and its state as attributes:

| Attribute | Present while |
| --- | --- |
| `data-disabled` | it ignores interaction |
| `data-readonly` | the value can be read but not edited |
| `data-required` | a value is asked for (announced as `aria-required`, not enforced by the browser) |
| `data-invalid` | the value is invalid, or a number breaks its `min`, `max` or `step` |
| `data-filled` | it holds a non-empty value |
| `data-focused` | it has focus |
