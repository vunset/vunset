# Addon

Addons are the bits that sit inside a field's box, next to the value: a
`https://` before a URL, a unit after a number, a button at the end. There's
no component for them, only the `form-addon` class, which keeps them muted,
centered and from shrinking.

::: preview ui/form-addon/Basic
:::

## Usage

Most of the time you don't need the class at all. FormInput, FormTextarea,
FormSelect, FormCombobox and FormToggleGroup have `#start` and `#end` slots,
and whatever you put there is already an addon:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormInput } from '@vunset/ui';

const site = ref('');
</script>

<template>
  <FormInput v-model="site" label="Website">
    <template #start>https://</template>
  </FormInput>
</template>
```

FormDatepicker is the exception: it has an `#icon` slot for the calendar
icon, and no `#start` or `#end`.

## With your own control

Building a field from the [`@vunset/vue`](/forms/field) parts? Give them
the same classes and it looks like the rest:

- the `FieldGroup` is the box: `form-control form-input`
- the `Input` inside it: `form-input-control`
- each [`Addon`](/utilities/addon): `form-addon`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Addon, FieldRoot, FieldGroup, FieldLabel, Input } from '@vunset/vue';

const weight = ref('');
</script>

<template>
  <FieldRoot class="form-field">
    <FieldLabel class="form-label">Weight</FieldLabel>
    <FieldGroup class="form-control form-input">
      <Input v-model="weight" class="form-input-control" />
      <Addon side="end" class="form-addon">kg</Addon>
    </FieldGroup>
  </FieldRoot>
</template>
```

Clicking an addon that isn't a button still focuses the input, so the whole
box feels like one control.

## Buttons

Put an `AppButton` at either end of the box and it joins the box: it sits
flush against the border, takes the box's full height, and keeps its inner
border as a divider.

Anywhere else, like before a select's clear button or next to a textarea's
first line, the button sits inset and sized to fit. Give it `size="xs"` or
`size="sm"` to keep its own height.

::: preview ui/form-addon/Buttons
:::

## Styling

| Class        | On                                                         |
| ------------ | ---------------------------------------------------------- |
| `form-addon` | An `Addon`, at either end of a control's box (`data-side`) |

The class lives in `form-field.css`, together with the label, help and error.
