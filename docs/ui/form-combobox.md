# FormCombobox

A text input that filters a list of options as you type, with its label,
help text and error message. Pick one value, or several with `multiple`,
shown as chips. With `creatable`, typed text can become a new value. It's
built on [Combobox](/forms/combobox).

Attributes like `aria-label` or `autocomplete` go on the `<input>`.

::: preview ui/form-combobox/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

const framework = ref<string | null>(null);
</script>

<template>
  <FormCombobox v-model="framework" label="Framework" :options="['Vue', 'Svelte']" />
</template>
```

It takes the same `options` as [FormSelect](/ui/form-select#usage): plain
values, objects with `value`, `label` and `disabled`, or groups. Typing
filters them by label. Pass your own `filter` function to match differently.

A clear button shows by default while there's a value. Set
`:clearable="false"` to hide it.

## Examples

### Multiple

With `multiple`, `v-model` is an array, and each choice shows as a chip with a
remove button. <kbd>Backspace</kbd> in an empty input removes the last one.

The placeholder disappears once there's a chip, and the input shrinks to fit
next to them. Add `show-placeholder` to keep it.

::: preview ui/form-combobox/Multiple
:::

### Creatable

With `creatable`, typing something that matches no option offers a "Create"
row. Choosing it makes your text the value. `@create` fires first, so you can
add it to your options for next time.

::: preview ui/form-combobox/Creatable
:::

### Presets

Presets are named sets of values above the list, for picking several options
in one click. They work exactly as on [FormSelect](/ui/form-select#presets),
which explains them in full. As you type, the presets are filtered too, and a
folded group opens when it has a match.

::: preview ui/form-combobox/Presets
:::

### Presets over a long list

With a `max-height`, the list scrolls below the presets while they stay put.
Folding a group keeps the presets from taking too much room.

::: preview ui/form-combobox/PresetsLongList
:::

### Flatten

`flatten` sets how many chips show. The rest collapse into a count.

::: preview ui/form-combobox/Flatten
:::

### Validation

`error` shows a message and marks the combobox invalid. `required` adds an
asterisk and tells screen readers a value is needed; the browser doesn't
enforce it, so the check is up to you.

::: preview ui/form-combobox/Validation
:::

### Read-only

A read-only combobox doesn't open, and its chips have no remove buttons.

::: preview ui/form-combobox/ReadOnly
:::

### Disabled

`disabled` grays the combobox out and takes it out of the form.

::: preview ui/form-combobox/Disabled
:::

### Hundreds of presets

620 options and over 300 presets in one folded group, some with labels long
enough to wrap, or with no space to wrap at. Typing and the columns keep it
usable.

::: preview ui/form-combobox/ManyPresets
:::

## Keyboard

Focus stays in the input. The arrow keys move a highlight through the
options, and screen readers follow it.

| Key | Closed | Open |
| --- | --- | --- |
| <kbd>↓</kbd> <kbd>↑</kbd> | Open, on the selected option, else the first (or last) | Next or previous option, wrapping at the ends |
| <kbd>Home</kbd> <kbd>End</kbd> | | First or last option |
| A letter | Typed, and opens | Typed, filtering the list to the first match |
| <kbd>Enter</kbd> | Submits the form, as an input does | Choose the option and close; with `multiple`, toggle it and stay open; on the create row, create it |
| <kbd>Backspace</kbd> | With `multiple` and an empty input, take back the last chip | The same |
| <kbd>Esc</kbd> | | Close |
| <kbd>Tab</kbd> | | Close, and move on |

## Styling

| Class | On |
| --- | --- |
| `form-combobox` | The root |
| `form-control` | The box's look, shared by every `Form*` field: [form-control.css](/ui/theming#the-field-box) |
| `form-combobox-trigger` | The box, one row with the clear button and chevron at its end, with its `data-*` state |
| `form-combobox-values` | The chips and the input, wrapping onto more lines as chips are added |
| `form-combobox-input` | The `<input>` |
| `form-combobox-chips` | The chips, wrapping alongside the input; each chip and its label by `data-part` |
| `form-combobox-chip-remove` | A chip's remove button |

The popup, list, presets, scroll arrows, empty state and chevron use the
`form-listbox-*` classes shared with [FormSelect](/ui/form-select#styling).
The [Combobox](/forms/combobox) page lists every part's `data-*` state. The
field around it uses the [FormField](/ui/form-field) classes.

To add your own classes inside, use `control-class` (the box), `values-class`
(the chips and input), `popup-class`,
`label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-combobox.css

## API Reference

### FormCombobox

::: api form/FormCombobox
:::
