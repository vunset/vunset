# FormDatepicker

A field that shows the picked date and opens a calendar in a popup, with its
label, help text and error message. Pick one day, a range, or several days.
It's built on [Datepicker](/forms/datepicker).

Attributes like `aria-label` or `data-*` go on the trigger.

::: preview ui/form-datepicker/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormDatepicker } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const arrival = ref<CalendarValue>(null);
</script>

<template>
  <FormDatepicker v-model="arrival" label="Arrival" placeholder="Pick a date" />
</template>
```

It takes every option of [FormCalendar](/ui/form-calendar): `mode`, `min`,
`max`, `presets`, `locale` and the rest.

The field shows the value formatted for `locale`:

| Picked | Shows |
| --- | --- |
| One day | `Oct 3, 2026` |
| A range | `Oct 3 – Oct 9, 2026` |
| A range, only the start so far | `Oct 3, 2026 –` |
| Two days, with `mode="multiple"` | `Oct 3, 2026, Oct 5, 2026` |
| More than two days | `3 days` |

To show it your own way, use the `#value` slot. It gets the `dates` and the
`text` above.

There's no clear button by default. Add `clearable` to show one while there's
a value.

## Examples

### Range

The popup stays open until you've picked both ends, then closes. Picking a
preset closes it too. If you close it after picking only one end, the range
is that single day.

::: preview ui/form-datepicker/Range
:::

### A range without presets

A range shows presets next to the calendar by default. `:presets="false"`
leaves just the calendar.

::: preview ui/form-datepicker/RangeNoPresets
:::

### A report filter

A typical filter for a report, sending dates to a server:

- `v-model.iso` writes `YYYY-MM-DD` strings instead of `Date`s, ready for a
  query string.
- `.iso.safe` helps when your server works in UTC and rejects future dates.
  Early in the day, ahead of UTC, "today" is still tomorrow for the server, so
  `.safe` writes yesterday instead.
- `preset` fills an empty model with a preset's days, here the last 30.
- A range offers six presets by itself: today, yesterday, the last 7 and 30
  days, this month and last month. `with-year` and `with-quarters` add this
  year and its quarters.
- `max-today` rules out the future.

::: preview ui/form-datepicker/Filter
:::

### Multiple

With `mode="multiple"`, the popup stays open while you pick several days. Add
`close-on-select` to close it after each pick.

::: preview ui/form-datepicker/Multiple
:::

### Validation

`error` shows a message and marks the field invalid. `required` adds an
asterisk and tells screen readers a date is needed; the browser doesn't
enforce it, so the check is up to you.

::: preview ui/form-datepicker/Validation
:::

### Read-only

A read-only datepicker shows its value but doesn't open. If it's `clearable`,
the clear button is hidden too.

::: preview ui/form-datepicker/ReadOnly
:::

### Disabled

`disabled` grays the field out and takes it out of the form.

::: preview ui/form-datepicker/Disabled
:::

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Enter</kbd> <kbd>Space</kbd> | On the trigger, open or close the popup |
| <kbd>Esc</kbd> | Close the popup, focus back on the trigger |

When the popup opens, focus moves to the picked day, or to today. From there,
the [calendar's keys](/forms/calendar#keyboard) work.

## Styling

| Class | On |
| --- | --- |
| `form-control` | The box's look, shared by every `Form*` field: [form-control.css](/ui/theming#the-field-box) |
| `form-datepicker` | The box around the trigger and the clear button, with its `data-*` state and `data-open` |
| `form-datepicker-trigger` | The trigger: the icon and the value |
| `form-datepicker-value` | The value, with `data-placeholder` while nothing is picked |
| `form-datepicker-popup` | The popup, which is also a `form-calendar` |

The calendar in the popup has the [FormCalendar](/ui/form-calendar#styling)
classes. The field around it uses the [FormField](/ui/form-field) classes.

To add your own classes inside, use `control-class` (the `form-datepicker`
box around the trigger and the clear button), `popup-class`, `label-class`,
`help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-datepicker.css

## API Reference

### FormDatepicker

::: api form/FormDatepicker
:::
