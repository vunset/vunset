# Calendar

A month grid for picking a day, a range of days, or several days, with month
and year views to jump around quickly. You decide what each cell looks like,
and each one tells you its state (`data-selected`, `data-today`,
`data-in-range`, …) so you can style it.

::: preview calendar/Basic
:::

## Anatomy

You don't write the cells one by one. Each cell part draws its whole list:

- `CalendarWeekDay` draws the seven weekday names.
- `CalendarWeek` draws a row per week, and the `CalendarDay` inside it draws
  that week's seven days.
- `CalendarMonth` draws the twelve months, and `CalendarYear` the years on
  the page.
- `CalendarPreset` draws every preset.

A class on a part goes on every cell it draws, and its slot shapes each
cell's content.

The three views can sit side by side in your template. `view` on a
`CalendarRow` shows the row only in that view, so you don't need any `v-if`.

```vue
<script setup lang="ts">
import {
  CalendarRoot,
  CalendarPrev,
  CalendarNext,
  CalendarViewTrigger,
  CalendarGrid,
  CalendarRow,
  CalendarWeek,
  CalendarWeekDay,
  CalendarDay,
  CalendarMonth,
  CalendarYear,
  CalendarPresets,
  CalendarPreset
} from '@vunset/vue';
</script>

<template>
  <CalendarRoot>
    <CalendarPrev />
    <CalendarViewTrigger value="month" />
    <CalendarViewTrigger value="year" />
    <CalendarNext />

    <CalendarGrid>
      <CalendarRow view="day">
        <CalendarWeekDay />
      </CalendarRow>
      <CalendarWeek>
        <CalendarDay />
      </CalendarWeek>

      <CalendarRow view="month">
        <CalendarMonth />
      </CalendarRow>

      <CalendarRow view="year">
        <CalendarYear />
      </CalendarRow>
    </CalendarGrid>

    <CalendarPresets>
      <CalendarPreset />
    </CalendarPresets>
  </CalendarRoot>
</template>
```

The month and year views are a single row of twelve cells, and the Up and
Down arrows move through it three at a time. Lay that row out in three
columns so the keys match what you see.

### One cell at a time

If you'd rather lay out the grid yourself, give a cell part a `value` and it
draws just that cell. `CalendarGrid`'s slot gives you the lists and the
current view:

```vue
<CalendarGrid v-slot="{ view, weeks, weekDays, months, years }">
  <template v-if="view === 'day'">
    <CalendarRow>
      <CalendarWeekDay v-for="day in weekDays" :key="day.index" :value="day.index" />
    </CalendarRow>
    <CalendarRow v-for="(week, i) in weeks" :key="i">
      <CalendarDay v-for="date in week" :key="date.getTime()" :value="date" />
    </CalendarRow>
  </template>
  <CalendarRow v-else-if="view === 'month'">
    <CalendarMonth v-for="(month, i) in months" :key="month" :value="i" />
  </CalendarRow>
  <CalendarRow v-else>
    <CalendarYear v-for="year in years" :key="year" :value="year" />
  </CalendarRow>
</CalendarGrid>
```

## Examples

### Range

`mode="range"` lets you pick a start day, then an end day. Once both are
picked, the days between them get `data-in-range`, and the two ends get
`data-range-start` and `data-range-end`. While you're choosing the end, the
same attributes follow the pointer, so you see the range before you click,
and the day under the pointer gets `data-preview`.

::: preview calendar/Range
:::

### Multiple

`mode="multiple"` lets you click days on and off, building a list.

::: preview calendar/Multiple
:::

### Limits

`min` and `max` limit what can be picked, and the arrows stop there.
`max-today` rules out every day after today. If you set `max` too, the earlier
of the two wins. `disabled-dates` rules out single days, and
`is-date-disabled` takes a function for anything else, like weekends here.

::: preview calendar/Limits
:::

### Presets

Presets are ready-made ranges, like "Last 7 days", shown by `CalendarPreset`.
Pick them with `presets`:

- Built-in keys: `today`, `yesterday`, `last-7`, `last-30`, `this-month`,
  `last-month`, `this-year` and `q1`–`q4`.
- Your own: `{ key, label, range }`.
- `'base'` is the first six built-ins (the default), and `'all'` is every
  built-in. You can mix them into a list: `['base', 'this-year']`. A key listed
  twice shows once.

A preset that lies entirely outside `min` and `max` is disabled, and one
that overlaps them is cut to fit. A quarter that hasn't started yet is
disabled too. Your own ranges can be in the future.

::: preview calendar/Presets
:::

### The model

`v-model` holds `Date` objects. Modifiers change what it writes back:

| Modifier | Writes |
| --- | --- |
| `.iso` | `YYYY-MM-DD` strings for the local day: `'2026-10-03'`, or a list for `range` and `multiple` |
| `.iso.safe` | The same, but today is written as yesterday while UTC is still on yesterday |
| `.safe` | Dates, with the same step back |
| `.optional` | `undefined` instead of an empty value once cleared |

`.safe` is for apps whose server keeps its days in UTC. Just after midnight
east of Greenwich, the user's "today" hasn't started in UTC yet, so asking
the server for it returns nothing. `.safe` asks for yesterday instead until
UTC catches up.

`preset` sets the starting value from a preset. Without `v-model` it's the
default value; with a `v-model` that starts empty, it's written once. A model
that already holds a value is left alone.

```vue
<CalendarRoot v-model.iso="period" mode="range" preset="last-30" max-today>
```

### Locale

`locale` sets the language of the months and weekdays, and the day each row
starts on: Sunday for `en-US`, Monday for `de-DE`. `first-day-of-week` picks
that day yourself, `0` being Sunday. `fixed-weeks` always draws
six rows, so the calendar keeps the same height from month to month.

::: preview calendar/Locale
:::

### Forms

Give it a `name`, and the picked days are submitted as hidden inputs, each a
`YYYY-MM-DD` string for the local day: one for `single`, the start and the
end of a finished `range`, and one per day for `multiple`, in date order.
`required` and `invalid` mark it for styling and screen readers, but you do
the validating, as on [Select](/forms/select).

Inside a [Field](/forms/field), the calendar is named by the field's label
and described by its messages, follows the field's disabled, read-only,
required and invalid state, and takes its `name`. Give the `FieldLabel`
`as="div"`, since there's no single input for it to point at.

For a calendar that opens from a button, use [Datepicker](/forms/datepicker).

## Keyboard

The grid is one stop when you tab through the page. The arrow keys move
within it, and turn the page when they go past its edge.

| Key | In the day view | In the month and year views |
| --- | --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Previous or next day | Previous or next cell |
| <kbd>↑</kbd> <kbd>↓</kbd> | Same day a week earlier or later | The cell three before or after |
| <kbd>Home</kbd> <kbd>End</kbd> | First or last day of the week | First or last cell of the page |
| <kbd>Page Up</kbd> <kbd>Page Down</kbd> | Previous or next month; a year with <kbd>Shift</kbd> | Previous or next year (twelve with <kbd>Shift</kbd>) in the month view; previous or next twelve years in the year view |
| <kbd>Enter</kbd> <kbd>Space</kbd> | Pick the day | Open that month or year |

## API Reference

### CalendarRoot

The element carries `data-part="calendar"`.

::: api calendar/CalendarRoot
:::

### CalendarPrev, CalendarNext

Turn the page: a month in the day view, a year in the month view, twelve years
in the year view. They're disabled at `min` or `max`, and labeled with the
page they turn to.

The elements carry `data-part="prev"` or `data-part="next"`.

::: api calendar/CalendarPrev
:::

### CalendarViewTrigger

Opens the month or year view, and goes back to the days. By default it shows
the month's name or the year.

The element carries `data-part="view-trigger"`, `data-view`, and `data-open`
while its view is showing.

::: api calendar/CalendarViewTrigger
:::

### CalendarGrid

The grid that takes the keyboard (`role="grid"`), named for the page on
screen.

The element carries `data-part="grid"` and `data-view`.

::: api calendar/CalendarGrid
:::

### CalendarRow

The element carries `data-part="row"` and `role="row"`.

::: api calendar/CalendarRow
:::

### CalendarWeek

A row per week of the month on screen, in the day view only. A `CalendarDay`
without a `value` inside it draws that week's seven days.

Each row carries `data-part="row"` and `role="row"`.

::: api calendar/CalendarWeek
:::

### CalendarWeekDay

A column heading. By default it shows the short name, and screen readers
hear the full one.

The element carries `data-part="week-day"` and `role="columnheader"`.

::: api calendar/CalendarWeekDay
:::

### CalendarDay

The element carries `data-part="day"`, `role="gridcell"`, and
`aria-current="date"` on today.

::: api calendar/CalendarDay
:::

### CalendarMonth

The element carries `data-part="month"`.

::: api calendar/CalendarMonth
:::

### CalendarYear

The element carries `data-part="year"`.

::: api calendar/CalendarYear
:::

### CalendarPresets

The element carries `data-part="presets"`.

::: api calendar/CalendarPresets
:::

### CalendarPreset

The element carries `data-part="preset"`. By default it shows the preset's
label.

::: api calendar/CalendarPreset
:::
