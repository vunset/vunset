# Datepicker

A button that shows the picked date and opens a calendar in a popup. It takes
every option a [Calendar](/forms/calendar) does, and you put the calendar's
parts in the popup just as you would in a `CalendarRoot`.

::: preview datepicker/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  DatepickerRoot,
  DatepickerTrigger,
  DatepickerValue,
  DatepickerClear,
  Portal,
  Positioner,
  Popup,
  CalendarGrid,
  CalendarWeek,
  CalendarDay
} from '@vunset/vue';
</script>

<template>
  <DatepickerRoot>
    <DatepickerTrigger>
      <DatepickerValue />
    </DatepickerTrigger>
    <DatepickerClear />

    <Portal>
      <Positioner>
        <Popup>
          <!-- any Calendar parts: arrows, view triggers, grid, presets -->
          <CalendarGrid>
            <CalendarWeek>
              <CalendarDay />
            </CalendarWeek>
          </CalendarGrid>
        </Popup>
      </Positioner>
    </Portal>
  </DatepickerRoot>
</template>
```

`DatepickerClear` goes beside the trigger, not inside it, because a button
can't contain another button.

## Examples

### Range

With `mode="range"` the popup stays open until both ends are picked. Choosing
a preset, which sets the whole range, closes it too. If you close it with
only one end picked, the range becomes that single day.

::: preview datepicker/Range
:::

### Field

Inside a [Field](/forms/field), the trigger is the field's control. The
label names it together with its value, and clicking the label opens it.
`name` (here the field's) submits the value as hidden `YYYY-MM-DD` inputs.

::: preview datepicker/Field
:::

## The value

`DatepickerValue` writes the value in the root's `locale` (`en-US` by
default). While nothing is picked, it shows `placeholder` and gets
`data-placeholder`.

| Mode | Text |
| --- | --- |
| `single` | `Oct 3, 2026` |
| `range` | `Oct 3 – Oct 9, 2026`, with the year on both ends when they differ. `Oct 3, 2026 –` while the end is still to pick |
| `multiple` | `Oct 3, 2026, Oct 5, 2026`, or a count like `3 days` once there are more than two |

To write it another way, use its slot, which gets `dates` and `text`.

## The model

`v-model`, its modifiers (`.iso`, `.safe`, `.optional`), `preset` and
`max-today` work exactly as on [Calendar](/forms/calendar#the-model):

```vue
<DatepickerRoot v-model.iso="period" mode="range" preset="last-30" presets="base" max-today>
```

## Closing

`close-on-select` closes the popup once the pick is complete: a day for
`single`, the second end for `range`. It's on by default, except for
`multiple`, which stays open so you can pick several. Escape and a click
outside close it too, and focus goes back to the trigger. When it opens,
focus lands on the selected day, or on today.

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> <kbd>Space</kbd> | On the trigger, open or close the popup |
| <kbd>Esc</kbd> | Close the popup |

Inside the popup, the calendar's own keys work: see
[Calendar](/forms/calendar#keyboard).

## API Reference

### DatepickerRoot

The element carries `data-part="datepicker"`, and holds the hidden inputs for
`name`.

::: api datepicker/DatepickerRoot
:::

### DatepickerTrigger

The element carries `data-part="trigger"`, `aria-haspopup="dialog"` and
`aria-expanded`.

::: api datepicker/DatepickerTrigger
:::

### DatepickerValue

The element carries `data-part="value"`.

::: api datepicker/DatepickerValue
:::

### DatepickerClear

Only shown while there's a value and the datepicker isn't disabled or
read-only. Clicking it clears the value and moves focus to the trigger.

The element carries `data-part="clear"` and `aria-label="Clear"`.

::: api datepicker/DatepickerClear
:::
