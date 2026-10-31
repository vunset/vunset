# FormTextarea

A multi-line text field with its label, help text and error message, all in
one. It's built on [Field](/forms/field) and [Textarea](/forms/textarea).

Anything you'd put on a `<textarea>`, like `placeholder`, `rows` or `wrap`,
goes straight on the component and ends up on the `<textarea>`.

::: preview ui/form-textarea/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormTextarea } from '@vunset/ui';

const bio = ref('');
</script>

<template>
  <FormTextarea v-model="bio" label="Bio" />
</template>
```

## Examples

### Validation

`error` shows a message and marks the field invalid. `required` adds an
asterisk and tells screen readers the field is required; the browser doesn't
enforce it, so checking the value is up to you.

::: preview ui/form-textarea/Validation
:::

### Autosize

With `autosize`, the textarea grows as you type, starting from `rows`.
`max-rows` sets a limit; past it, the text scrolls. The resize handle goes
away, since it would fight the automatic height.

::: preview ui/form-textarea/Autosize
:::

### Counter

`max-length` stops typing and pasting past the limit. Put a counter in the
`#label-end` slot to show how much is left.

::: preview ui/form-textarea/Counter
:::

### Addons

The `#start` and `#end` slots put something inside the box, next to the
first line of text. A button there sits inset and is sized to fit that line.
See [Addon](/ui/form-addon).

::: preview ui/form-textarea/Addons
:::

### Read-only

`read-only` shows the text but doesn't let you change it. It can still be
focused and copied.

::: preview ui/form-textarea/ReadOnly
:::

### Disabled

`disabled` grays the field out and takes it out of the form.

::: preview ui/form-textarea/Disabled
:::

## Styling

| Class                   | On                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `form-control`          | The box's look, shared by every `Form*` field: [form-control.css](/ui/theming#the-field-box)       |
| `form-textarea`         | The box around the textarea and its addons: a [FieldGroup](/forms/field), with its `data-*` state |
| `form-textarea-control` | The `<textarea>`: a [Textarea](/forms/textarea), with its `data-*` state                          |

The field around it uses the [FormField](/ui/form-field) classes.

To add your own classes inside, use `control-class` (the box),
`textarea-class` (the `<textarea>`), `label-class`, `help-class` and
`error-class`. See [Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-textarea.css

## API Reference

### FormTextarea

::: api form/FormTextarea
:::
