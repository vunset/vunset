# FormSelect

A select with its label, help text and error message. You click a trigger
that shows the value, and pick from a popup of options. It can also search,
pick several values, and offer presets. It's built on [Select](/forms/select).

Attributes like `aria-label` or `data-*` go on the trigger.

::: preview ui/form-select/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const country = ref<string | null>(null);
</script>

<template>
  <FormSelect v-model="country" label="Country" :options="['France', 'Germany']" />
</template>
```

An option can be a plain value, which is also its label, or an object with
`value`, `label` and `disabled`. If your objects use other field names, point
at them with `value-key` and `label-key`. An object with its own `options`
becomes a group.

There's no clear button by default. Add `clearable` to show one while there's
a value.

## Examples

### Groups

An object with `label` and `options` puts those options under a heading.

::: preview ui/form-select/Groups
:::

### Searchable

`searchable` puts a search box at the top of the popup, which filters the
options as you type.

::: preview ui/form-select/Searchable
:::

### Multiple

With `multiple`, `v-model` is an array, and the popup stays open while you
pick. `flatten` sets how many chosen options the trigger names before the rest
collapse into a count. The `#option` slot renders each option your own way.

::: preview ui/form-select/Multiple
:::

### Presets

Presets are named sets of values, shown above the list, for picking several
options in one click. They need `multiple`.

```ts
const presets = [
  { label: 'Nordics', values: ['dk', 'fi', 'no', 'se'] },
  { label: 'Retired', values: ['yu'], disabled: true },
  {
    label: 'By region',
    collapsed: true,
    presets: [
      { label: 'Benelux', values: ['be', 'nl', 'lu'] },
      { label: 'Baltics', values: ['ee', 'lv', 'lt'] }
    ]
  }
];
```

- Click a preset to add its values. Click it again, while all of them are
  chosen, to take them back out.
- The arrow next to a preset replaces your whole selection with exactly that
  set.
- `{ label, presets }` groups presets under a heading you can fold.
  `collapsed: true` starts it folded.
- With `searchable`, the search box filters presets too, by their own label or
  their group's.

A few props help with longer lists: `presets-label` puts the loose presets
under a heading of their own, and `preset-columns` lays them out in columns.
To render each preset your own way, use the `#preset` slot.

::: preview ui/form-select/Presets

::: preview ui/form-select/Presets
:::

### Align with trigger

`align-with-trigger` places the popup so the chosen option sits right over
the trigger, like a native select on macOS. It's ignored with `searchable` or
`virtual`, since there the list has to start at the top.

::: preview ui/form-select/AlignWithTrigger
:::

### Validation

`error` shows a message and marks the select invalid. `required` adds an
asterisk and tells screen readers a choice is needed; the browser doesn't
enforce it, so the check is up to you.

::: preview ui/form-select/Validation
:::

### Addons

The `#start` and `#end` slots put something inside the trigger, before or
after the value. See [Addon](/ui/form-addon).

::: preview ui/form-select/Addons
:::

### Virtual

For a long list, `virtual` renders only the options near where you've
scrolled, so the popup stays fast. It needs `max-height`, and works on lists
without groups.

::: preview ui/form-select/Virtual
:::

### Read-only

A read-only select shows its value and can be focused, but doesn't open.

::: preview ui/form-select/ReadOnly
:::

### Disabled

`disabled` grays the select out and takes it out of the form.

::: preview ui/form-select/Disabled
:::

### Hundreds of presets

620 options and over 300 presets in one folded group, some with labels long
enough to wrap, or with no space to wrap at. The search box finds presets the
same way it finds options.

::: preview ui/form-select/ManyPresets
:::

## Keyboard

Focus stays on the trigger, or in the search box with `searchable`. The arrow
keys move a highlight through the options, and screen readers follow it.

| Key                                            | On the trigger                               | In the popup                                                                    |
| ---------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| <kbd>↓</kbd> <kbd>Enter</kbd> <kbd>Space</kbd> | Open, on the selected option, else the first |                                                                                 |
| <kbd>↑</kbd>                                   | Open, on the selected option, else the last  |                                                                                 |
| <kbd>↓</kbd> <kbd>↑</kbd>                      |                                              | Next or previous option, wrapping at the ends                                   |
| <kbd>Home</kbd> <kbd>End</kbd>                 |                                              | First or last option                                                            |
| <kbd>Enter</kbd>                               |                                              | Choose the option and close; with `multiple`, toggle it and stay open           |
| <kbd>Space</kbd>                               |                                              | As <kbd>Enter</kbd>, unless there is a search box to type in                    |
| A letter                                       |                                              | The next option starting with what was typed; with a search box, filter instead |
| <kbd>Backspace</kbd>                           |                                              | With `multiple` and an empty search box, take back the last choice              |
| <kbd>Esc</kbd>                                 |                                              | Close                                                                           |
| <kbd>Tab</kbd>                                 |                                              | Close, and move on                                                              |

## Styling

| Class                         | On                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `form-select`                 | The root                                                                                         |
| `form-control`                | The box's look, shared by every `Form*` field: [form-control.css](/ui/theming#the-field-box) |
| `form-select-trigger`         | The trigger, with its `data-*` state                                                             |
| `form-select-value`           | The value or placeholder inside it                                                               |
| `form-listbox-indicator`      | The chevron                                                                                      |
| `form-listbox-popup`          | The popup                                                                                        |
| `form-select-search`          | The search box                                                                                   |
| `form-listbox-body`           | Everything under the search: it scrolls once the popup reaches the room it has                   |
| `form-listbox-presets`        | The presets above the list, their sections by `data-part`                                        |
| `form-listbox-preset-check`   | The tick before a preset's title, while all its values are chosen                                |
| `form-listbox-preset-label`   | A preset's title, cut to one line, the whole of it in `title`                                    |
| `form-listbox-preset-chevron` | A preset section's chevron, turned while it is folded                                            |
| `form-listbox-viewport`       | The list and its scroll arrows, under the search and presets                                     |
| `form-listbox-list`           | The list, with its options and groups by `data-part`                                             |
| `form-listbox-scroll`         | The scroll arrows at the list's ends                                                             |
| `form-listbox-empty`          | Shown when a search matches nothing                                                              |

The [Select](/forms/select) page lists every part's `data-*` state. The field
around it uses the [FormField](/ui/form-field) classes. The `form-listbox-*`
classes are shared with [FormCombobox](/ui/form-combobox) and live in
`form-listbox.css`.

To add your own classes inside, use `control-class` (the trigger),
`popup-class`, `label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-select.css

<<< ../../packages/ui/src/form/form-listbox.css

## API Reference

### FormSelect

::: api form/FormSelect
:::
