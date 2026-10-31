# FormInput

A text input with its label, help text and error message, all in one. It's
built on [Field](/forms/field) and [Input](/forms/input).

Anything you'd put on an `<input>`, like `placeholder`, `autocomplete` or
`inputmode`, goes straight on the component and ends up on the `<input>`.

::: preview ui/form-input/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';

const name = ref('');
</script>

<template>
  <FormInput v-model="name" label="Name" />
</template>
```

## Examples

### Validation

`error` shows a message and marks the input invalid. `required` adds an
asterisk to the label and tells screen readers the field is required. The
browser doesn't enforce it, so the form still submits; checking the value is
up to you.

::: preview ui/form-input/Validation
:::

### Clearable

`clearable` adds a button that empties the input. It shows only while
there's something to clear.

::: preview ui/form-input/Clearable
:::

### Start and end

The `#start` and `#end` slots put something inside the box, before or after
the text: a prefix, a unit, an icon. See [Addon](/ui/form-addon).

### Number

With `type="number"`, only numbers can be typed. A `min` of zero or more
keeps the minus sign out too.

::: preview ui/form-input/Number
:::

### Counter

`max-length` stops typing and pasting past the limit. Put a counter in the
`#end` slot to show how much is left.

::: preview ui/form-input/Counter
:::

### Transform

`transform` rewrites the text once it's committed, on blur or Enter, and never
while typing. `toSeparatedList` from `@vunset/utils` tidies a list kept in one
string.

::: preview ui/form-input/Transform
:::

### Password

`type="password"` with `autocomplete="new-password"` and a `min-length`, the
way a sign-up form wants it.

::: preview ui/form-input/Password
:::

### Read-only

`read-only` shows the value but doesn't let you change it. It can still be
focused and copied.

::: preview ui/form-input/ReadOnly
:::

### Disabled

`disabled` grays the field out and takes it out of the form.

::: preview ui/form-input/Disabled
:::

## Styling

| Class | On |
| --- | --- |
| `form-control` | The box's look, shared by every `Form*` field: [form-control.css](/ui/theming#the-field-box) |
| `form-input` | The box around the input and its addons: a [FieldGroup](/forms/field), with its `data-*` state |
| `form-input-control` | The `<input>` |

The field around it uses the [FormField](/ui/form-field) classes.

To add your own classes inside, use `control-class` (the box), `input-class`
(the `<input>`), `label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-input.css

## API Reference

### FormInput

::: api form/FormInput
:::
