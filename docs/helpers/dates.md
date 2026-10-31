# Dates

Plain functions for days: reading a date from whatever you have, stepping it
by days, months or years, comparing it, and writing it out for people or for
a server. They're what [Calendar](/forms/calendar) and
[Datepicker](/forms/datepicker) are built on.

```ts
import { formatDate, subDays, presetRange } from '@vunset/utils';

formatDate('2026-10-23'); // 'Oct 23, 2026'
subDays('2026-10-23', 1); // Thu Oct 22 2026, local midnight
presetRange('last-7'); // [a week ago, yesterday]
```

They come from `@vunset/utils`, which depends on nothing. `@vunset/vue`
exports them too, and [`@vunset/nuxt`](/nuxt/get-started) imports them for you.

## Days, not moments

A date picked in a calendar is a day, not a moment in time. These functions
treat it that way:

- A bare `'2026-10-23'` is read as that day in your time zone. JavaScript's
  own `new Date('2026-10-23')` reads it as midnight in UTC, which is still the
  22nd anywhere west of Greenwich.
- Stepping, comparing and `startOf…` work on the local calendar, so adding a
  day across a daylight-saving change still lands on the next day's midnight.

Every function that works on a day takes a `DateLike`: a `Date`, a string, or
a timestamp in milliseconds. A string it can't read gives an
[Invalid Date](#invalid-input), like `new Date('junk')` does.

```ts
addDays(new Date(2026, 9, 23), 9); // Sun Nov 01 2026
addDays('2026-10-23', 9); // the same
isSameDay(new Date(2026, 9, 23, 18, 30), '2026-10-23'); // true
```

### Sending a day to a server

Turned into JSON, a `Date` is always written in UTC. Local midnight on the
23rd in Kyiv becomes `2026-10-22T21:00:00.000Z`, and someone in New York reads
it as the 22nd. Send the day as text instead:

```ts
formatISO(new Date(2026, 9, 23)); // '2026-10-23'
```

`toDate` reads that string back as the same day in any time zone. A
datepicker does this for you with `v-model.iso`.

## Formatting

`formatDate` writes a date for people, through `Intl`. Without options it's
the short form, with the year:

```ts
const date = new Date(2026, 9, 23, 18, 30);

formatDate(date); // 'Oct 23, 2026'
formatDate(date, { format: 'long' }); // 'October 23, 2026'
formatDate(date, { time: true }); // 'Oct 23, 2026, 18:30'
formatDate(date, { year: false }); // 'Oct 23'
formatDate(date, { format: 'iso' }); // '2026-10-23'
formatDate(date, { locale: 'de-DE' }); // '23. Okt. 2026'
formatDate(date, { options: { weekday: 'long' } }); // 'Friday'
```

A missing or unreadable date gives `'N/A'`, or your own `fallback`:

```ts
formatDate(null); // 'N/A'
formatDate(null, { fallback: '—' }); // '—'
```

`formatDateRange` writes two days as one span, and shows the year once when
both share it:

```ts
formatDateRange('2026-10-03', '2026-10-09'); // 'Oct 3 – Oct 9, 2026'
formatDateRange('2025-12-28', '2026-01-03'); // 'Dec 28, 2025 – Jan 3, 2026'
```

## Ranges

`presetRange` gives the two ends of a named range, as whole days. The rolling
ones (`last-7`, `last-30`) end yesterday, unless you include today:

```ts
const reference = '2026-10-23';

presetRange('last-7', { reference }); // Oct 16 → Oct 22
presetRange('last-7', { reference, includeToday: true }); // Oct 17 → Oct 23
presetRange('last-month', { reference }); // Sep 1 → Sep 30
presetRange('q2', { reference }); // Apr 1 → Jun 30
```

Without `reference`, it counts from today.

`setDateRange` lists every day between two ends, both included:

```ts
setDateRange('2026-10-23', '2026-10-25'); // [Oct 23, Oct 24, Oct 25]
```

## Invalid input

`toDate` is the one function that tells you it found nothing: it returns
`null` for `null`, `undefined`, `''`, or anything that doesn't parse.

```ts
toDate('2026-10-23'); // Fri Oct 23 2026, local midnight
toDate('junk'); // null
```

The day functions return an Invalid Date for input they can't read, so they
never need a null check. `formatDate` shows an Invalid Date as its
`fallback`. Use `toDate` when you need to know whether input was usable.

## API Reference

### Types

| Type        |                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `DateLike`  | `Date \| string \| number`<div>What the day functions take.</div>                                         |
| `DateInput` | `DateLike \| null \| undefined`<div>What `toDate` and the formatters take, missing values included.</div> |
| `WeekDay`   | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`<div>`0` is Sunday, as `Date.prototype.getDay` counts.</div>             |

`DAYS_IN_WEEK` is `7` and `MONTHS_IN_YEAR` is `12`.

### toDate

`(input: DateInput) => Date | null`: a new `Date` from any input, or `null`
when there's nothing usable. A `Date` is copied, never handed back, and a bare
`YYYY-MM-DD` is read as a local day.

### addDays, addMonths, addYears

`(date: DateLike, amount: number) => Date`: a new date `amount` days, months
or years away. A negative `amount` goes back.

A month step keeps the day of the month, but no further than the month
allows: `addMonths('2026-01-31', 1)` is Feb 28. `addYears` turns Feb 29 into
Feb 28 the same way.

### subDays, subMonths, subYears

`(date: DateLike, amount: number) => Date`: the same, going back.
`subDays(date, 1)` is `addDays(date, -1)`.

### startOfDay, endOfDay

`(date: DateLike) => Date`: midnight on the same local day, or its last
millisecond, `23:59:59.999`.

### startOfMonth, endOfMonth, startOfYear, endOfYear

`(date: DateLike) => Date`: the first or last day of its month or year, at
midnight.

### daysInMonth

`(year: number, month: number) => number`: how many days the month has.
`month` counts from `0`, as `Date` does: `daysInMonth(2024, 1)` is `29`.

### compareDay

`(a: DateLike, b: DateLike) => number`: below zero when `a` is an earlier day
than `b`, zero on the same day, above zero after. The time of day is ignored,
so it sorts days: `dates.sort(compareDay)`.

### isSameDay, isSameMonth

`(a: DateLike, b: DateLike) => boolean`: whether both fall on the same day, or
in the same month of the same year.

### isToday, isWeekend

`(date: DateLike) => boolean`: whether it's today, or a Saturday or Sunday.

### isWithin

`(date: DateLike, min?: DateLike | null, max?: DateLike | null) => boolean`:
whether the day falls between `min` and `max`, both included. A missing end
doesn't limit that side.

### clampDate

`(date: DateLike, min?: DateLike | null, max?: DateLike | null) => Date`: the
date itself when it's inside, otherwise the end it passed. Compares days, and
keeps the time of whichever it returns.

### formatDate

`(date: DateInput, options?: FormatDateOptions) => string`

| Option      | Default   |                                                                                     |
| ----------- | --------- | ----------------------------------------------------------------------------------- |
| `format`    | `'short'` | `'short'` (Oct 23), `'long'` (October 23) or `'iso'` (`2026-10-23`, without `Intl`) |
| `time`      | `false`   | Adds the hours and minutes                                                          |
| `year`      | `true`    | Shows the year                                                                      |
| `utc`       | `false`   | Reads the date in UTC instead of your time zone                                     |
| `safe`      | `false`   | Steps today back a day, as `formatSafeISO` does                                     |
| `options`   |           | `Intl.DateTimeFormatOptions` of your own, used instead of the three above           |
| `locale`    | `'en-US'` |                                                                                     |
| `hourCycle` | `'h23'`   |                                                                                     |
| `fallback`  | `'N/A'`   | What a missing or unreadable date gives                                             |

### formatDateRange

`(from: DateInput, to: DateInput, options?) => string`: two days as one span,
`Oct 3 – Oct 9, 2026`. Takes `format`, `locale` and `fallback` from
`formatDate`'s options, and gives `fallback` when either end is missing.

### formatISO

`(date: DateInput) => string`: the local day as `YYYY-MM-DD`, or `'N/A'` for a
missing date.

### formatSafeISO

`(date: DateInput) => string`: `formatISO`, except for today while UTC is
still on yesterday. Just after midnight in Tokyo, UTC hasn't reached the new
day, so this returns yesterday, and a server on UTC never receives a day it
hasn't reached. West of Greenwich, UTC is ahead, and today is left alone.
Other days are never changed.

### presetRange

`(key: DatePresetKey, options?: PresetRangeOptions) => [Date, Date]`: the two
ends of a named range, at midnight, first one first.

| Key                        | Range                                                           |
| -------------------------- | --------------------------------------------------------------- |
| `today`, `yesterday`       | That one day                                                    |
| `last-7`, `last-30`        | The 7 or 30 days ending yesterday, or today with `includeToday` |
| `this-month`, `last-month` | The whole calendar month                                        |
| `this-year`                | Jan 1 to Dec 31                                                 |
| `q1` to `q4`               | That quarter of this year                                       |

| Option         | Default |                                   |
| -------------- | ------- | --------------------------------- |
| `reference`    | today   | The day to count from             |
| `includeToday` | `false` | Ends `last-7` and `last-30` today |

### setDateRange

`(start: DateInput, end: DateInput) => Date[]`: every day from `start` to
`end`, both included, at midnight. Empty when either is missing, or `end`
comes first.

### monthNames

`(locale?, format?: 'long' | 'short' | 'narrow') => string[]`: the twelve
month names, January first. `format` is `'long'` by default.

### firstDayOfWeek

`(locale?) => WeekDay`: the day a week starts on where `locale` is used, `0`
being Sunday. Monday where the runtime has no week info for it.

```ts
firstDayOfWeek('en-US'); // 0
firstDayOfWeek('de-DE'); // 1
```

### weekDayNames

`(locale?, firstDayOfWeek?: WeekDay) => WeekDayName[]`: the seven days, from
`firstDayOfWeek` on, the locale's own first day by default. Each has its
`index`, as `getDay` counts, and its `long`, `short` and `narrow` names.

```ts
weekDayNames('de-DE')[0]; // { index: 1, long: 'Montag', short: 'Mo', narrow: 'M' }
```
