# Timepicker

A time of day, typed into hour and minute segments, or picked from columns in
a popup. The value is a string, `'14:30'`, the same in every locale.

::: preview timepicker/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import {
  TimepickerRoot,
  TimepickerInput,
  TimepickerTrigger,
  TimepickerClear,
  TimepickerColumn,
  Portal,
  Positioner,
  Popup
} from '@vunset/vue';
</script>

<template>
  <TimepickerRoot>
    <TimepickerInput />
    <TimepickerTrigger />
    <TimepickerClear />

    <Portal>
      <Positioner>
        <Popup>
          <TimepickerColumn unit="hour" />
          <TimepickerColumn unit="minute" />
        </Popup>
      </Positioner>
    </Portal>
  </TimepickerRoot>
</template>
```

`TimepickerInput` draws a segment for each unit, with `:` between them. To
draw them yourself, put `TimepickerSegment`s in it: `<TimepickerSegment
unit="hour" />`.

## Opening

The popup opens when focus enters the segments, by Tab, a click or the field's
label, and focus stays on the segment: keep typing, and the columns follow.
It closes on Escape, a press outside, or focus leaving both the picker and the
popup. After Escape it stays closed while you move between segments; press a
segment to open it again.

`TimepickerTrigger` is optional. It toggles the popup and moves focus into the
first column, for picking with the keys. With `:open-on-focus="false"`, the
popup opens only from the trigger.

The popup lines up with the whole picker, not the trigger, and pressing the
picker while it's open doesn't close it.

## The value

`v-model` is `'HH:mm'`, always two digits each, or `null` while empty. It's
written only once every segment is filled: emptying one writes `null`, and
the others keep what they show.

An incoming value is read leniently: `'9:5'` shows as `09:05`. One that isn't
a time, such as `'25:00'`, shows as empty. `v-model.optional` writes
`undefined` instead of `null`.

## Keyboard

| Key | On a segment |
| --- | --- |
| <kbd>0</kbd>–<kbd>9</kbd> | Types the value. Focus moves on once no other digit could follow |
| <kbd>↑</kbd> <kbd>↓</kbd> | One up or down, wrapping. From empty, the lowest or the highest |
| <kbd>PageUp</kbd> <kbd>PageDown</kbd> | Ten minutes or seconds up or down; an hour |
| <kbd>Home</kbd> <kbd>End</kbd> | The lowest or the highest |
| <kbd>Backspace</kbd> <kbd>Delete</kbd> | Empties it |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>:</kbd> | The previous or next segment |
| <kbd>A</kbd> <kbd>P</kbd> | On the AM/PM segment, sets it |

| Key | On a column |
| --- | --- |
| <kbd>↑</kbd> <kbd>↓</kbd> | Picks the previous or next value, wrapping |
| <kbd>Home</kbd> <kbd>End</kbd> | Picks the first or last |
| <kbd>←</kbd> <kbd>→</kbd> | The neighboring column |
| <kbd>Enter</kbd> <kbd>Esc</kbd> | Closes the popup |

Typing `2` waits for a second digit, since `20` to `23` could follow; `3`
moves straight on to the minutes. A second digit that would pass the maximum
starts over: `2` then `5` is `05`.

With `min` or `max`, the arrows, Home and End skip what's outside them.

## Examples

### Seconds

`seconds` adds a third segment, the `second` column renders, and the value is
`'HH:mm:ss'`. A value without seconds reads as `:00`.

::: preview timepicker/Seconds
:::

### 12-hour

`:hour-cycle="12"` shows the hour as 12, 01–11 and adds an AM/PM segment, and
the `period` column renders. The value stays 24-hour: `'14:30'` shows as
`02:30 PM`, and nothing is written until AM or PM is set. Type <kbd>A</kbd> or
<kbd>P</kbd> on it, or step it with the arrows. `period-labels` changes its
text, and typing either label's first letter still sets it.

::: preview timepicker/TwelveHour
:::

### Min and max

`min` and `max` bound what the arrows and the columns reach. An option with no
time inside them is disabled, with `data-disabled`: at 09 with
`min="09:30"`, minutes 00–29 are. A pick that leaves the minutes outside moves
onto the bound, so picking 09 from `12:10` gives `09:30`.

Typing isn't held back: a time typed outside is written as typed, and the
picker gets `data-invalid` until it's back inside. Without `seconds`, a bound
with seconds rounds inward to the minute. A `min` after `max`, a range over
midnight, isn't supported, and bounds nothing.

::: preview timepicker/Bounds
:::

### In a field

Inside a `FieldRoot`, the picker is the field's control. The label names it,
and clicking the label focuses the hours. With a `name`, a hidden input
submits the value, or nothing while it's empty.

::: preview timepicker/Field
:::

## Picking in the popup

Each column lists every value of its unit (in 12-hour, the hours of the AM or
PM shown) and scrolls its pick to the middle,
inside the column, never moving the page. Scrolling a column only looks
around: a click or a key picks. Picking while the value is empty fills the
other units with `00`, so the value is complete at once. Picking doesn't close
the popup.

To have a column come to rest with a value in the middle, snap it in CSS:

```css
[data-part='column'] {
  scroll-snap-type: y mandatory;
}

[data-part='option'] {
  scroll-snap-align: center;
}
```

## API Reference

### TimepickerRoot

The element carries `data-part="timepicker"`, and the state below as `data-*`
attributes. So do the input and the trigger.

::: api timepicker/TimepickerRoot
:::

### TimepickerInput

A `group`, named by the field's label inside a `FieldRoot`. The element carries
`data-part="input"`; its separators carry `data-part="separator"`.

::: api timepicker/TimepickerInput
:::

### TimepickerSegment

A `spinbutton` named "Hours", "Minutes", "Seconds" or "AM/PM". The element carries
`data-part="segment"`, `data-unit`, and `data-placeholder` while empty.

::: api timepicker/TimepickerSegment
:::

### TimepickerTrigger

A button named "Choose time" that opens the popup. The element carries
`data-part="trigger"`.

::: api timepicker/TimepickerTrigger
:::

### TimepickerClear

Shown while there's a value and it can change. It empties every segment and
focuses the first. The element carries `data-part="clear"`.

::: api timepicker/TimepickerClear
:::

### TimepickerColumn

A `listbox` for one unit. A `second` column renders nothing without
`seconds`, and a `period` column nothing in 24-hour. The element carries
`data-part="column"` and `data-unit`; each option carries `data-part="option"`,
`data-value` (its label: `07`, `12`, `PM`), `data-selected` while picked, and
`data-disabled` outside `min`/`max`.

::: api timepicker/TimepickerColumn
:::
