# FormCalendar

A calendar shown right on the page, with its label, help text and error
message. Pick one day, a range, or several days. It's built on
[Calendar](/forms/calendar).

Want it in a popup that opens from a field instead? Use
[FormDatepicker](/ui/form-datepicker).

::: preview ui/form-calendar/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { FormCalendar } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const arrival = ref<CalendarValue>(null);
</script>

<template>
  <FormCalendar v-model="arrival" label="Arrival" />
</template>
```

What `v-model` holds depends on `mode`:

- `single` (the default): a `Date`, or `null`.
- `range`: `[start, end]`.
- `multiple`: an array of `Date`s.

Give it a `name`, and a form submits each picked day as `YYYY-MM-DD`. A range
is submitted once both ends are picked.

## Examples

### Range

With `mode="range"`, you pick a start, then an end, and the days between are
shaded. Presets show under the grid: today, yesterday, the last 7 and 30 days,
this month and last month.

To choose which presets show, pass `presets` a list. It can mix:

- built-in keys: `today`, `yesterday`, `last-7`, `last-30`, `this-month`,
  `last-month`, `this-year`, `q1` to `q4`
- your own presets: `{ key, label, range }`
- the groups `base` (the six above) and `all` (everything built in)

`:presets="false"` hides them.

::: preview ui/form-calendar/Range
:::

### Year and quarters

`with-year` adds "This year" to the presets. `with-quarters` adds Q1 to Q4 as
one joined row; a quarter that hasn't started yet is disabled.

On a single or multiple calendar, which has no presets by default, either one
also brings in the six base presets.

::: preview ui/form-calendar/Quarters
:::

### A report filter

A typical filter for a report, sending dates to a server:

- `v-model.iso` writes `YYYY-MM-DD` strings instead of `Date`s, ready for a
  query string.
- `.iso.safe` helps when your server works in UTC and rejects future dates.
  Early in the day, ahead of UTC, "today" is still tomorrow for the server, so
  `.safe` writes yesterday instead.
- `preset` fills an empty model with a preset's days, here the last 30.
- `max-today` rules out the future.

::: preview ui/form-calendar/Filter
:::

### Limits

- `min` and `max` set the earliest and latest day you can pick.
- `disabled-dates` rules out a list of days.
- `is-date-disabled` takes a function, for rules a list can't express, like
  every weekend.

`required` and `error` mark the calendar for styling and screen readers. The
browser doesn't enforce anything, so the check is up to you.

::: preview ui/form-calendar/Limits
:::

## Keyboard

The grid is one stop for <kbd>Tab</kbd>. The arrow keys move around inside
it, and turn the page when you go past the edge.

| Key | In the day view | In the month and year views |
| --- | --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Previous or next day | Previous or next cell |
| <kbd>↑</kbd> <kbd>↓</kbd> | Same day a week earlier or later | The cell three before or after |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last day of the week | First or last cell of the page |
| <kbd>Page Up</kbd> <kbd>Page Down</kbd> | Previous or next month; a year with <kbd>Shift</kbd> | Previous or next year (twelve with <kbd>Shift</kbd>) in the month view; previous or next twelve years in the year view |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Pick the day | Open that month or year |

## Styling

| Class | On |
| --- | --- |
| `form-calendar` | The calendar's box, with its `data-*` state |
| `form-calendar-header` | The arrows and the view switches, each a small [AppButton](/ui/app-button) |
| `form-calendar-title` | The month and year switches, `data-open` on the one showing |
| `form-calendar-grid` | The grid |
| `form-calendar-week` | A row of seven: the weekday names, or a week |
| `form-calendar-weekday` | A weekday name |
| `form-calendar-day` | A day, with `data-selected`, `data-range-start`, `data-range-end`, `data-in-range`, `data-preview`, `data-today`, `data-outside`, `data-disabled` |
| `form-calendar-cells` | The months or years, three to a row |
| `form-calendar-cell` | A month or a year, with `data-selected` and `data-current` |
| `form-calendar-presets` | The presets, two to a row |
| `form-calendar-preset` | A preset, an outline AppButton |
| `form-calendar-quarters` | Q1–Q4, an [AppGroup](/ui/app-group) across the row |

The cell size is `--ui-calendar-cell`, set on `.form-calendar`. The
[Calendar](/forms/calendar) page lists every part's `data-*` state. The field
around it uses the [FormField](/ui/form-field) classes.

To add your own classes inside, use `control-class` (the calendar),
`label-class`, `help-class` and `error-class`. See
[Classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/form/form-calendar.css

## API Reference

### FormCalendar

::: api form/FormCalendar
:::
