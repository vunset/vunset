# Field

Connects a label, a description and an error message to the control inside
it. The label names the control, the messages describe it to screen readers,
and every part gets the field's state as `data-*` attributes to style. It
works with `Input` and with every other control in the library.

::: preview field/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { FieldRoot, FieldLabel, FieldGroup, Addon, Input, FieldDescription, FieldError } from '@vunset/vue';
</script>

<template>
  <FieldRoot>
    <FieldLabel />
    <FieldGroup>
      <Addon side="start" />
      <Input />
      <Addon side="end" />
    </FieldGroup>
    <FieldDescription />
    <FieldError />
  </FieldRoot>
</template>
```

`FieldGroup` and `Addon` are optional. An `Input` can sit in the field on
its own. The input's own options, like `type="number"` and `filter`, are on
the [Input](/forms/input) page. A [Textarea](/forms/textarea) works in the
same place.

## Examples

### Validation

`invalid` marks the field and shows `FieldError`. `match` on `FieldError`
decides when the message appears. Here it waits until the field has been
touched, which the field's slot tells you.

::: preview field/Validation
:::

### Field state

The field's slot gives you its state: `filled`, `dirty`, `focused`,
`touched` and the rest. The field, its label, group and messages carry the
same state as `data-*` attributes (`data-filled`, `data-focused`, …). Without
`match`, `FieldError` shows for as long as the field is invalid: here, past
forty characters.

::: preview field/State
:::

### Addons

A `FieldGroup` holds the input with `Addon`s at either end, so you can draw
one box around all of them. Clicking anywhere in the group focuses the
input, unless you click something interactive, like the clear button.

::: preview field/Addons
:::

### Server errors

Errors from your server can go straight to the fields. Give each field a
`name`, then pass the errors to `useValidate().setErrors()`: an object keyed
by name, or a list of `{ path, message }` issues. A field's message clears as
soon as the user changes its value.

::: preview field/ServerErrors
:::

### Other controls

A field works with any control in the library, here a
[Select](/forms/select). The label names the select's trigger, and clicking
the label focuses it.

::: preview field/WithSelect
:::

### Disabled and read-only

`disabled` and `read-only` on the field apply to the control inside, and
every part gets `data-disabled` or `data-readonly`.

::: preview field/Disabled
:::

## API Reference

### FieldRoot

The element carries `data-part="field"` and the field's state: `data-disabled`,
`data-readonly`, `data-required`, `data-touched`, `data-dirty`,
`data-filled`, `data-focused` and `data-invalid`, each while it's true. Its
label, group and messages carry the same.

::: api field/FieldRoot
:::

### FieldLabel

A `<label>` pointing at the control. A control that isn't a form element,
like a select's trigger, is named by it through `aria-labelledby` instead.
It carries `data-part="field-label"`.

::: api field/FieldLabel
:::

### FieldGroup

The element carries `data-part="field-group"`.

::: api field/FieldGroup
:::

`Addon` is documented under [Addon](/utilities/addon).

### FieldDescription

Describes the control to screen readers, through `aria-describedby`. It
carries `data-part="field-description"`.

::: api field/FieldDescription
:::

### FieldError

Only rendered while it's shown, and through its exit animation. While it's
there, it describes the control too. Without `match` or `name`, it shows
while the field is invalid. It carries `data-part="field-error"`.

::: api field/FieldError
:::

### useValidate

A store of error messages keyed by field name. Fields with a `name` read
their message from it. By default every field on the page shares one store.
To give a form its own, create one with `createValidationStore()` and
`provideValidation(store)` it in the form's component: `useValidate()` and
the fields below it use that one.

```ts
import { createValidationStore, provideValidation } from '@vunset/vue';

const store = provideValidation(createValidationStore());
```

| Member        | Type                                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `errors`      | `Readonly<Ref<Record<string, string \| undefined>>>`<div>One message per field name.</div>                                                                                        |
| `setErrors`   | `(input: ValidationInput) => void`<div>Replaces every error, from an object keyed by name (an array value keeps its first message) or a list of `{ path, message }` issues.</div> |
| `clearErrors` | `(name?: string) => void`<div>Clears one field's error, or all of them.</div>                                                                                                     |
