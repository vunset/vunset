# FormCheckbox

A checkbox with its label beside it, and help text and an error under the
label. Clicking the label toggles it too. It's built on
[Checkbox](/forms/checkbox).

No label? Give it an `aria-label`, and it goes on the checkbox itself.

::: preview ui/form-checkbox/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckbox } from '@vunset/ui';

const terms = ref(false);
</script>

<template>
  <FormCheckbox v-model="terms" label="Accept the terms" />
</template>
```

## Examples

### Custom values

`true-value` and `false-value` set what `v-model` holds while checked and
unchecked.

::: preview ui/form-checkbox/CustomValues
:::

### Group

Bind several checkboxes to the same array, and each one adds its `value` to
it while checked. `indeterminate` shows a dash instead of a tick, for an
"all" box whose children disagree.

A [FormCheckboxGroup](/ui/form-checkbox-group) does all of this for you, with
one label for the whole set. Inside one, a checkbox with `parent` becomes the
"all" box: it checks or clears every other box, and turns indeterminate on its
own.

::: preview ui/form-checkbox/Group
:::

### Label slot

Need a link in the label? The `#label` slot takes markup. `#help` and
`#error` work the same way.

::: preview ui/form-checkbox/LabelSlot
:::

### Read-only

A read-only checkbox can still be focused and is still announced, but you
can't change it.

::: preview ui/form-checkbox/ReadOnly
:::

### Disabled

`disabled` grays the checkbox out and takes it out of the form.

::: preview ui/form-checkbox/Disabled
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Space</kbd> | Toggle it, on release, like a native checkbox |
| <kbd>Enter</kbd> | Toggle it |

## Styling

| Class | On |
| --- | --- |
| `form-checkbox` | The box: a [CheckboxRoot](/forms/checkbox), with its `data-*` state |
| `form-checkbox-indicator` | The tick or the dash inside it |

The field around it uses the [FormField](/ui/form-field) classes, in the
`inline` layout.

To add your own classes inside, use `control-class` (the box), `label-class`,
`help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-checkbox.css

## API Reference

### FormCheckbox

::: api form/FormCheckbox
:::
