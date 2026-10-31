# FormCheckboxGroup

A set of checkboxes under one label, all writing to one array. Pass
`options`, or put `FormCheckbox`es with a `value` inside it. It's built on
[CheckboxGroup](/forms/checkbox#group).

::: preview ui/form-checkbox-group/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckboxGroup, FormCheckbox } from '@vunset/ui';

const topics = ref<string[]>([]);
</script>

<template>
  <FormCheckboxGroup v-model="topics" label="Topics" :options="['vue', 'css']" />

  <FormCheckboxGroup v-model="topics" label="Topics">
    <FormCheckbox value="vue" label="Vue" />
    <FormCheckbox value="css" label="CSS" />
  </FormCheckboxGroup>
</template>
```

An option can be a plain value, which is also its label, or an object with
`value`, `label`, `help` and `disabled`. Any other fields you add are passed
to the `#option` slot, so you can render them. The array lists the values in
the order the checkboxes appear.

## Examples

### Select all

`select-all` adds an "all" checkbox at the top. It checks or clears the rest,
and shows a dash while only some are checked. Pass a string to give it a
label. Disabled and read-only checkboxes keep their state and aren't counted.

::: preview ui/form-checkbox-group/SelectAll
:::

### Validation

`required` marks the set and tells screen readers at least one is needed.
The browser doesn't enforce it, so the check is up to you: pass `error` to
show a message under the set and mark it invalid.

::: preview ui/form-checkbox-group/Validation
:::

### Horizontal

`orientation="horizontal"` lays the checkboxes out in a row.

::: preview ui/form-checkbox-group/Horizontal
:::

### Children

Put `FormCheckbox`es inside instead of passing `options`, when each one needs
its own label and help. Inside a group, the group decides which are checked,
so a checkbox's own `v-model` is ignored.

::: preview ui/form-checkbox-group/Children
:::

### Read-only

A read-only group can still be focused, but its checkboxes can't be changed.

::: preview ui/form-checkbox-group/ReadOnly
:::

### Disabled

`disabled` grays out every checkbox and takes them out of the form.

::: preview ui/form-checkbox-group/Disabled
:::

## Keyboard

Each checkbox is a tab stop of its own.

| Key              | Does                                    |
| ---------------- | --------------------------------------- |
| <kbd>Space</kbd> | Toggle the focused checkbox, on release |
| <kbd>Enter</kbd> | Toggle the focused checkbox             |

## Styling

| Class                 | On                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `form-checkbox-group` | The checkboxes' container: a [CheckboxGroup](/forms/checkbox#checkboxgroup), with `data-orientation` and its `data-*` state |
| `form-checkbox-all`   | The select-all checkbox's field                                                                                                  |

Each checkbox is a [FormCheckbox](/ui/form-checkbox), with its classes. The
set's layout is shared with `FormRadioGroup` and lives in `form-field.css`.

To add your own classes inside, use `control-class` (the container of
checkboxes), `label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

## API Reference

### FormCheckboxGroup

::: api form/FormCheckboxGroup
:::
