# FormField

The label, help text and error message around a control. Every `Form*`
component is built on it. Use it yourself to give any other control the same
frame, already wired up for screen readers through a [Field](/forms/field).

::: preview ui/form-field/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { FormField } from '@vunset/ui';
</script>

<template>
  <FormField label="Username" help="Letters, digits and dashes." error="That one is taken.">
    <!-- any control from @vunset/vue -->
  </FormField>
</template>
```

Set `id`, `name`, `disabled`, `read-only`, `required` or `invalid` on the
field, and the control inside picks them up. You don't repeat them on the
control.

`required` marks the field, it doesn't enforce anything. The label gets a red
asterisk and screen readers hear that the field is required, but the browser
won't stop the form from submitting. Check the value yourself and set
`error`.

Without a label, the asterisk moves into the control's top-right corner, or
right after a lone checkbox or switch. Either way, it disappears once the
field has a value.

## Examples

### Error

`error` shows a message and marks the field invalid. On a field with a box
(an input, a select, a toggle group), the message is a small chip sitting on
the box's bottom edge. Anywhere else, it's red text under the control.

Keep `error` `undefined` while nothing is wrong. To mark the control invalid
without a message, use `invalid`.

::: preview ui/form-field/Error
:::

### Required, with no label

With no label, the asterisk moves into the control's top-right corner and
disappears once there's a value. Name the control some other way, here with
`aria-label`.

::: preview ui/form-field/Required
:::

### Server errors

Give the field a `name`. When `useValidate().setErrors()` sets an error for
that name, for example from your server's response, the field shows it as if
you'd passed it to `error`.

::: preview ui/form-field/ServerErrors
:::

### Inline

`layout="inline"` puts the control first and the label beside it, with the
help and error under the label. `FormCheckbox` and `FormSwitch` use it.

::: preview ui/form-field/Inline
:::

### Size

`size="sm"` or `size="lg"` works on any `Form*` component. It makes the
control shorter or taller, with padding and text to match, while the label,
help and error keep their size. Checkboxes, radios, switches and range thumbs
shrink or grow instead.

Sizes come from the `--ui-control-*`, `--ui-check-size` and `--ui-switch-*`
[tokens](/ui/theming#sizes), so a control of your own that uses them follows
along.

```vue
<FormInput label="Search" size="sm" />
```

Every `Form*` field at each size, side by side:

::: preview ui/form-field/Sizes
:::

### Beside the label

`#label-start` goes before the label, and `#label-end` at the far end of its
row. Use them for an icon, a hint, or a "Forgot password?" link. Both sit
outside the `<label>`, so clicking a link there doesn't also focus the
control. Every `Form*` component has them.

::: preview ui/form-field/LabelEnds
:::

## Styling

| Class | On |
| --- | --- |
| `form-field` | The field, with `data-layout`, `data-size`, and its state: `data-required`, `data-filled`, `data-invalid`, `data-disabled`, `data-readonly`, `data-focused`, `data-touched`, `data-dirty` |
| `form-label` | The label, with `data-required` and `data-disabled` |
| `form-help` | The help text |
| `form-error` | The error message |
| `form-label-row` | The label with `#label-start` and `#label-end`, given either |
| `form-label-start`, `form-label-end` | Their content, before the label and at the row's far end |
| `form-addon` | Content at either end of a control's box |
| `form-clear` | The button that empties a control |
| `form-icon` | The icons the components draw |

To add your own classes to the label, help text and error message, use
`label-class`, `help-class` and `error-class`. Every `Form*` component has
them. See [Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-field.css

## API Reference

### FormField

::: api form/FormField
:::
