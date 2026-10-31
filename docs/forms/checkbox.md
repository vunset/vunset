# Checkbox

A checkbox you can style any way you like. A hidden native checkbox beside it
sends its value with your forms, and its state shows up as `data-*`
attributes for styling.

::: preview checkbox/Basic
:::

## Anatomy

A root and the indicator that shows while it's checked. A `CheckboxGroup`
around several gives them one array value.

```vue
<script setup lang="ts">
import { CheckboxGroup, CheckboxRoot, CheckboxIndicator } from '@vunset/vue';
</script>

<template>
  <CheckboxRoot>
    <CheckboxIndicator />
  </CheckboxRoot>

  <CheckboxGroup>
    <CheckboxRoot parent />
    <CheckboxRoot value="a" />
    <CheckboxRoot value="b" />
  </CheckboxGroup>
</template>
```

The root is a real `<button>`, which is what lets a `<label>` around it name
the checkbox. Where a button can't go, inside another button or a link, use
`as="span"` and give it an `aria-label` or `aria-labelledby` instead.

## Examples

### Array model

Bind several checkboxes to the same array, and each one adds or removes its
own `value`. A [group](#group) does the same with one `v-model`, and gives
the set a name.

::: preview checkbox/Array
:::

### Indeterminate

Set `indeterminate` on a parent checkbox while only some of its children are
checked. Clicking it still toggles `checked`, so it can select or clear them
all.

::: preview checkbox/Indeterminate
:::

### Group

A `CheckboxGroup` holds one array. Each box inside adds or removes its
`value`, and takes the group's `name`, `form`, and disabled, read-only and
invalid state. The group has `role="group"`, so give it a label: an
`aria-label`, or a `FieldRoot` and `FieldLabel` around it.

Values come out in the order the boxes appear. A value in your model that
has no box stays at the front, as it was.

::: preview checkbox/Group
:::

### Select all

A box with `parent` checks or clears every other box in its group, and shows
indeterminate while only some are checked. Disabled and read-only boxes keep
their state and don't count.

When the page is rendered on the server, the parent can't see the boxes
after it yet. Give the group `all-values`, the values of the boxes it should
count, and it shows the right state from the start.

::: preview checkbox/SelectAll
:::

### At least one

`required` on a group asks for at least one box to be checked. It's
announced (`aria-required`) and marked (`data-required`), but the browser
won't stop the form from submitting, so check it yourself on submit and show
a `FieldError`. A single box can't be required on its own.

::: preview checkbox/GroupRequired
:::

### Custom values

`true-value` and `false-value` set what `v-model` holds while checked and
unchecked.

::: preview checkbox/CustomValues
:::

### Disabled

A disabled checkbox can't be changed, and isn't sent with the form.

::: preview checkbox/Disabled
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Space</kbd> | Toggle it, on release, as a native checkbox does |
| <kbd>Enter</kbd> | Toggle it |

## API Reference

Inside a `FieldRoot`, the checkbox takes the field's `name`, id, and disabled,
read-only and invalid state.

### CheckboxRoot

The element carries `data-part="root"`. The name is shared with other
components' roots, so scope a `[data-part]` selector with a class of your
own.

A hidden `<input>` right after it carries the value to a form. It's rendered only
when the checkbox has a `name` or sits inside a `<label>`, so an unnamed one, like
a table's row checkbox, adds nothing to the page. The input is positioned
absolutely, so give the root's parent `position: relative` to keep it
inside a scrolling container.

::: api checkbox/CheckboxRoot
:::

### CheckboxGroup

Inside a `FieldRoot`, the group is the field's control: the field labels and
describes it, and it follows the field's state and takes its `name`. A
`FieldRoot` around a single box labels that box instead.

The element carries `data-part="checkbox-group"` and `role="group"`.

::: api checkbox/CheckboxGroup
:::

### CheckboxIndicator

The indicator is only rendered while the checkbox is checked or
indeterminate, and stays through its exit animation. `keep-mounted` keeps it
rendered all the time.

The element carries `data-part="indicator"`.

::: api checkbox/CheckboxIndicator
:::
