# Combobox

A text input that filters a popup list as you type. Pick one option, or
several as chips with `multiple`. With `creatable`, what you type can become
a new value. It works like [Select](/forms/select), except that you type in
the control itself.

::: preview combobox/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxInput,
  ComboboxClear,
  ComboboxIndicator,
  Portal,
  Positioner,
  Popup,
  ComboboxPresets,
  ComboboxScrollIndicator,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty
} from '@vunset/vue';
</script>

<template>
  <ComboboxRoot>
    <ComboboxTrigger>
      <ComboboxChips>
        <!-- optional: without it, each chip renders this by default -->
        <template #chip="option">
          <ComboboxChip :option="option">
            <ComboboxChipRemove />
          </ComboboxChip>
        </template>
      </ComboboxChips>
      <ComboboxInput />
      <ComboboxClear />
      <ComboboxIndicator />
    </ComboboxTrigger>

    <Portal>
      <Positioner>
        <Popup>
          <ComboboxPresets />
          <ComboboxScrollIndicator direction="up" />
          <ComboboxList>
            <!-- optional: without it, the list renders every row by default -->
            <template #default="{ options }">
              <ComboboxItem v-for="option in options" :key="option.value" :option="option" />
            </template>
          </ComboboxList>
          <ComboboxScrollIndicator direction="down" />
          <ComboboxEmpty />
        </Popup>
      </Positioner>
    </Portal>
  </ComboboxRoot>
</template>
```

`ComboboxChips` renders a chip with a remove button for each selection by
itself. Use the `#chip` slot only if you want to change them.

Options, `v-model` and `value-key`/`label-key` work as on
[Select](/forms/select#anatomy). The clear button shows while there's a
selection, unless you set `:clearable="false"`.

## Examples

### Groups

An item with its own `options` is a group, with its `label` as the heading.
Typing filters inside each group and hides a group with nothing left. A
disabled option can't be chosen, and the arrow keys skip it.

::: preview combobox/Groups
:::

### Multiple

With `multiple`, choices become chips beside the input, and `v-model` is an
array. `flatten` limits how many chips show, with a count for the rest.
Backspace in an empty input removes the last chip.

::: preview combobox/Multiple
:::

### Presets

`presets` are named sets of values for a multiple combobox, shown by
`ComboboxPresets` above the list. Choosing one adds its values, and choosing
it again removes them. Typing filters the presets by label, as it filters the
options. Groups and the `#replace` slot work as on
[Select](/forms/select#preset-groups).

::: preview combobox/Presets
:::

### Creatable

With `creatable`, text that matches nothing becomes an extra row at the end,
drawn by the `#create` slot. Pass a function instead of `true` to decide per
query: here, three letters or more. `@create` gives you the text, so you can
add it to your options.

::: preview combobox/Creatable
:::

### Custom chips

The `chip` slot builds each chip from `ComboboxChip`, here with a color dot,
and an icon as the remove button. To change only the button and keep the
default chip, use the `remove` slot instead.

::: preview combobox/CustomChips
:::

### Rows of your own

Give `ComboboxList` a default slot to render the rows yourself. It hands you
every option that matches the search, and you render each as a
`ComboboxItem`, with any markup inside. Your option objects are on
`option.option`, extra keys included.

The keys still reach every option, even ones you didn't render. So your own
virtualizer works too: render only the rows it picks, and scroll to the slot's
`activeIndex` when the highlight moves past them.

::: preview combobox/CustomRows
:::

### Your own virtualizer

Ten thousand options, with [TanStack Virtual](https://tanstack.com/virtual)
deciding which rows are in the page. The list's slot hands it every matching
option; it renders the few on screen, each a `ComboboxItem`. Typing filters
all ten thousand, and when the keys move the highlight past the rendered rows,
`activeIndex` says where to scroll.

Each row also carries `aria-setsize` and `aria-posinset`, so a screen reader
reads "City 9,000, 9,000 of 10,000" though only a dozen rows exist.

For rows of one height, the root's `virtual` does the same with no library:
see [Select](/forms/select#long-list).

::: preview combobox/OwnVirtualizer
:::

### Addons

Put an [`Addon`](/utilities/addon) in the trigger for an icon or a unit
beside the input. Clicking it focuses the input, like the rest of the
trigger.

::: preview combobox/Addons
:::

## Keyboard

Focus stays in the input, while the arrow keys move a highlight through the
options.

| Key | Closed | Open |
| --- | --- | --- |
| <kbd>↓</kbd> <kbd>↑</kbd> | Open, on the selected option, else the first (or last) | Next or previous option, wrapping at the ends unless `loop` is off |
| <kbd>Home</kbd> <kbd>End</kbd> | | First or last option |
| A letter | Typed, and opens | Typed, filtering the list to the first match |
| <kbd>Enter</kbd> | Submits the form, as an input does | Choose the option and close; with `multiple`, toggle it and stay open; on the create row, create it |
| <kbd>Backspace</kbd> | With `multiple` and an empty input, take back the last chip | The same |
| <kbd>Esc</kbd> | | Close |
| <kbd>Tab</kbd> | | Close, and move on |

## API Reference

The input is a real `<input>`, so a `<label for>` can name it. Give the root
an `id`, which goes on the input, as the examples do, or put the combobox in
a `FieldRoot`.

When the popup closes without a choice (Escape, Tab or a click outside),
whatever you typed is dropped and the selected option's label comes back.

`Portal`, `Positioner` and `Popup` work as on [Select](/forms/select#api-reference),
including `--listbox-trigger-width`, `max-height` and `virtual`.

### ComboboxRoot

The element carries `data-part="root"`.

::: api combobox/ComboboxRoot
:::

### ComboboxTrigger

The box around the chips and the input. Pressing anywhere in it focuses the
input and opens the popup.

The element carries `data-part="trigger"`.

::: api combobox/ComboboxTrigger
:::

### ComboboxChips

Only rendered with `multiple`.

The element carries `data-part="chips"`. Each chip is a `ComboboxChip`
holding a `data-part="chip-label"` and a `ComboboxChipRemove`. The count of
the rest is a `data-part="chip-overflow"`.

::: api combobox/ComboboxChips
:::

The `remove` slot swaps only the button and keeps the default chip around it:

```vue
<ComboboxChips>
  <template #remove>
    <ComboboxChipRemove :as="Icon" name="times" class="chip-remove" />
  </template>
</ComboboxChips>
```

The `chip` slot replaces the whole chip. Build it from `ComboboxChip`, which
passes its option on to the `ComboboxChipRemove` inside it:

```vue
<ComboboxChips>
  <template #chip="option">
    <ComboboxChip :option="option" class="chip">
      <Icon :name="option.value" />
      {{ option.label }}
      <ComboboxChipRemove aria-label="Remove">×</ComboboxChipRemove>
    </ComboboxChip>
  </template>
</ComboboxChips>
```

### ComboboxChip

One selected option. Pass it the `option` from the `chip` slot.

The element carries `data-part="chip"`.

::: api combobox/ComboboxChip
:::

### ComboboxChipRemove

Removes the option of the `ComboboxChip` it sits in. It isn't rendered while
the combobox is disabled or read-only, and Tab skips it: from the keyboard,
Backspace in the empty input removes chips instead.

The element carries `data-part="chip-remove"` and an `aria-label` of
`Remove <label>`.

::: api combobox/ComboboxChipRemove
:::

### ComboboxInput

The element carries `data-part="input"` and `role="combobox"`.

::: api combobox/ComboboxInput
:::

### ComboboxClear

The element carries `data-part="clear"`.

::: api listbox/ListboxClear
:::

### ComboboxIndicator

The element carries `data-part="indicator"`.

::: api listbox/ListboxIndicator
:::

### ComboboxList

The element carries `data-part="listbox"` and `role="listbox"`. The rows
it renders carry these:

| Row | Attributes |
| --- | --- |
| `data-part="option"` | `data-selected` while chosen, `data-active` while highlighted, `data-disabled`, and `data-create` on the row that creates the typed text |
| `data-part="group"` | `role="group"`, named by its label |
| `data-part="group-label"` | |

::: api listbox/ListboxList
:::

### ComboboxItem

A row you render yourself, from the list's default slot. It carries the same
attributes as a built-in row, plus `aria-setsize` and `aria-posinset` outside
groups, so a screen reader counts every option even when only some are
rendered.

::: api listbox/ListboxItem
:::

### ComboboxEmpty

The element carries `data-part="empty"`.

::: api listbox/ListboxEmpty
:::

### ComboboxScrollIndicator

The element carries `data-part="scroll"` and `data-direction`.

::: api listbox/ListboxScrollIndicator
:::

### ComboboxPresets

The same parts as [SelectPresets](/forms/select#selectpresets).

::: api listbox/ListboxPresets
:::
