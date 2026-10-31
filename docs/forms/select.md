# Select

A button that shows what's selected, and a popup list to choose from. Pick
one option, or several with `multiple`. The selection is sent with your forms
through hidden inputs, and every part carries the state as `data-*`
attributes for styling.

::: preview select/Basic
:::

## Anatomy

Pass the choices to the root as `options`, and build the trigger and the
popup from parts. Leave out any part you don't need.

```vue
<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectClear,
  SelectIndicator,
  Portal,
  Positioner,
  Popup,
  SelectSearch,
  SelectPresets,
  SelectScrollIndicator,
  SelectList,
  SelectItem,
  SelectEmpty
} from '@vunset/vue';
</script>

<template>
  <SelectRoot>
    <SelectTrigger>
      <SelectValue />
      <SelectClear />
      <SelectIndicator />
    </SelectTrigger>

    <Portal>
      <Positioner>
        <Popup>
          <SelectSearch />
          <SelectPresets />
          <SelectScrollIndicator direction="up" />
          <SelectList>
            <!-- optional: without it, the list renders every row by default -->
            <template #default="{ options }">
              <SelectItem v-for="option in options" :key="option.value" :option="option" />
            </template>
          </SelectList>
          <SelectScrollIndicator direction="down" />
          <SelectEmpty />
        </Popup>
      </Positioner>
    </Portal>
  </SelectRoot>
</template>
```

An option can be a plain value (`'Vue'`, `42`), or an object with `value`,
`label` and `disabled`. If your objects use other keys, name them with
`value-key` and `label-key`. Bind the selection with `v-model`: a single
value, or an array with `multiple`. `v-model.optional` writes `undefined`
instead of `null` or `[]` when the selection is cleared.

## Examples

### Groups

An item with its own `options` is a group, with its `label` as the heading.
A disabled option can't be chosen, and the arrow keys skip it.

::: preview select/Groups
:::

### Multiple

With `multiple`, `v-model` is an array and the popup stays open while you
pick. `flatten` limits how many choices the trigger names before it says
"Vue and 2 more". `SelectClear` clears the whole selection. It's only
rendered while there's something to clear, and `:clearable="false"` removes
it.

::: preview select/Multiple
:::

### Selected first

`order="selected-first"` moves the chosen options to the top of their group
each time the popup opens, so a long list starts with what's picked. Nothing
moves while it's open, so a row never jumps away from under the pointer.

::: preview select/SelectedFirst
:::

### Searchable

With `searchable`, the popup opens with focus in `SelectSearch`, and the list
filters as you type. `SelectEmpty` shows while nothing matches. Pass
`filter` to match options your own way.

::: preview select/Searchable
:::

### Custom option

The `#option` slot draws each row. Any extra keys on your option objects are
there too, on `option`.

To render the rows themselves, not only their content, give `SelectList` a
default slot of `SelectItem`s, as on
[Combobox](/forms/combobox#rows-of-your-own). That's also how your own
virtualizer plugs in.

::: preview select/CustomOption
:::

### Addons

Put an [`Addon`](/utilities/addon) in the trigger for an icon or a unit
beside the value. Clicking it opens the select like the rest of the trigger.

::: preview select/Addons
:::

### Align with trigger

`align-with-trigger` places the popup so the chosen option sits right over
the trigger, like a native select on macOS. Near the edge of the screen it
opens beside the trigger as usual instead. It's ignored with `searchable`.

::: preview select/AlignWithTrigger
:::

### Long list

For long lists, `virtual` renders only the rows near the scroll position. It
needs `max-height`, so the list has a height to scroll in.
`SelectScrollIndicator` shows while the list can scroll further in its
direction.

The rows share one height, measured from the first. Your own rows work too:
with `virtual`, the list's default slot gets only the options on screen, to
render as `SelectItem`s, and the list keeps the space around them. For rows
of different heights, use a virtualizer of your own, as on
[Combobox](/forms/combobox#your-own-virtualizer).

::: preview select/LongList
:::

### Presets

`presets` are named sets of values for a multiple select, like "Top 10", shown
by `SelectPresets`. Choosing one adds its values, and choosing it again
removes them.

::: preview select/Presets
:::

### Preset groups

Group presets with `{ label, presets }`. The group gets a heading you can
click to fold it away. Add `collapsed: true` to start it folded.

- A search opens every group that has a match.
- `presets-label` gives the presets outside any group a heading too, so they
  fold the same way.
- The `#replace` slot adds a second button to each preset, which replaces the
  selection with the preset's values instead of adding them.

::: preview select/PresetGroups
:::

### Disabled and read-only

A disabled select can't be used. A read-only one can still be focused and
read by screen readers, but doesn't open.

::: preview select/Disabled
:::

## Keyboard

Focus stays on the trigger, or in the search box with `searchable`, while
the arrow keys move a highlight through the options.

| Key | On the trigger | In the popup |
| --- | --- | --- |
| <kbd>↓</kbd> <kbd>Enter</kbd> <kbd>Space</kbd> | Open, on the selected option, else the first | |
| <kbd>↑</kbd> | Open, on the selected option, else the last | |
| <kbd>↓</kbd> <kbd>↑</kbd> | | Next or previous option, wrapping at the ends unless `loop` is off |
| <kbd>Home</kbd> <kbd>End</kbd> | | First or last option |
| <kbd>Enter</kbd> | | Choose the option and close; with `multiple`, toggle it and stay open |
| <kbd>Space</kbd> | | As <kbd>Enter</kbd>, unless there is a search box to type in |
| A letter | | The next option starting with what was typed; with a search box, filter instead |
| <kbd>Backspace</kbd> | | With `multiple` and an empty search box, take back the last choice |
| <kbd>Esc</kbd> | | Close |
| <kbd>Tab</kbd> | | Close, and move on |

## API Reference

Name the trigger with `aria-labelledby`, as the examples do, or put the
select in a `FieldRoot`, which labels it for you.

`Portal`, `Positioner` and `Popup` are shared with every overlay, and
documented under [Overlay parts](/utilities/overlay). Here the popup carries
`SelectRoot`'s state attributes. The positioner sets `--listbox-trigger-width`
to the trigger's width, which is handy for making the popup at least as wide.

Give the list `overflow-y: auto` and don't set a height on the popup: use
`max-height` to cap the list. `virtual` and `align-with-trigger` need to
measure the popup at its natural size.

### SelectRoot

The element carries `data-part="root"`.

::: api select/SelectRoot
:::

### SelectTrigger

A `<div>` that carries `data-part="trigger"` and `role="combobox"`, or
`role="button"` while `searchable`. It's focusable and opens on click and on
the keys above.

::: api select/SelectTrigger
:::

### SelectValue

The element carries `data-part="value"`. Its default content is a
`data-part="placeholder"` or a `data-part="summary"` span.

::: api select/SelectValue
:::

### SelectClear

The element carries `data-part="clear"`.

::: api listbox/ListboxClear
:::

### SelectIndicator

The element carries `data-part="indicator"`.

::: api listbox/ListboxIndicator
:::

### SelectSearch

The element carries `data-part="search"`.

::: api select/SelectSearch
:::

### SelectList

The element carries `data-part="listbox"` and `role="listbox"`. The rows
it renders carry these:

| Row | Attributes |
| --- | --- |
| `data-part="option"` | `data-selected` while chosen, `data-active` while highlighted by the keyboard or pointer, `data-disabled` |
| `data-part="group"` | `role="group"`, named by its label |
| `data-part="group-label"` | |

::: api listbox/ListboxList
:::

### SelectItem

A row you render yourself, from the list's default slot. It carries the same
attributes as a built-in row, plus `aria-setsize` and `aria-posinset` outside
groups, so a screen reader counts every option even when only some are
rendered.

::: api listbox/ListboxItem
:::

### SelectEmpty

The element carries `data-part="empty"`.

::: api listbox/ListboxEmpty
:::

### SelectScrollIndicator

The element carries `data-part="scroll"` and `data-direction`.

::: api listbox/ListboxScrollIndicator
:::

### SelectPresets

The element carries `data-part="presets"`. Inside it:

| Part | What it is |
| --- | --- |
| `data-part="preset-item"` | One preset's row, with `data-active` while all its values are selected, and `data-disabled` |
| `data-part="preset"` | The preset's button, with `aria-pressed` and the same `data-active` |
| `data-part="preset-replace"` | The `#replace` button |
| `data-part="preset-group"` | A group, with `data-open` or `data-closed` |
| `data-part="preset-group-trigger"` | The group's heading, a button with `aria-expanded` and `data-open` or `data-closed` |
| `data-part="preset-group-label"` | The heading's text |
| `data-part="preset-group-panel"` | The presets inside the group |

A folded panel stays rendered, but `inert`, so you can animate it shut. The
`#group-indicator` slot draws inside the heading, after the label, and gets
`open`.

::: api listbox/ListboxPresets
:::
