# Timepicker

A time of day, typed into segments or picked from columns in a popup. The
value is 24-hour and the same in every locale; the display may be 12-hour.

## Value

- `v-model` is `'HH:mm'`, or `'HH:mm:ss'` with `seconds`, always zero-padded.
  Empty is `null`. `.optional` writes `undefined` for empty, as elsewhere.
- An incoming value is read leniently: `'9:5'` is `09:05`; seconds are dropped
  without `seconds`, and `00` when `seconds` is on and the value has none.
  Anything else (`'25:00'`, `'abc'`) reads as empty.
- A value is published only when every segment is filled. Clearing any segment
  publishes `null`; the other segments keep what they show.
- The value changes only from the user: typing, a step, a pick or Clear. A new
  `v-model` replaces what every segment shows.

## Segments

`TimepickerInput` is a `group`, holding a `TimepickerSegment` per unit (hour,
minute, and second with `seconds`) with `:` between them. Each segment is a
`spinbutton`: `aria-valuemin`, `aria-valuemax`, `aria-valuenow` while filled,
`aria-valuetext` (`'09'`, or `'Empty'`), and an `aria-label` ("Hours",
"Minutes", "Seconds"). Each is a tab stop. An empty segment shows its
placeholder, `--`, with `data-placeholder`.

Keys on a focused segment:

| Key | Does |
| --- | --- |
| Digit | Types into it (below) |
| ArrowUp / ArrowDown | One up or down, wrapping (23 → 00). From empty: up gives the lowest, down the highest |
| PageUp / PageDown | Ten up or down for minutes and seconds, wrapping; 1 for hours, as an arrow |
| Home / End | The lowest / the highest |
| Backspace / Delete | Empties it |
| ArrowLeft / ArrowRight | The previous / next segment |
| `:`, `.`, Space | The next segment |

Typing: the first digit is the value (`2` shows `02`). If no second digit could
follow it without passing the maximum (`3` for hours, `6` for minutes), the
segment is done and focus moves on. Otherwise the second digit completes it
(`2` then `3` is `23`) and focus moves on, unless that passes the maximum
(`2` then `5`): then the new digit starts over as the first. Leaving the
segment ends the typing, so returning starts afresh. The last segment keeps
focus once done.

Disabled: segments aren't focusable and ignore keys. Read-only: focusable,
keys do nothing.

## 12-hour display

`hourCycle: 12` shows the hour as 12, 01–11 and adds a `period` segment after
the last one, with a space before it (`02:30 PM`). The value stays 24-hour:
12 AM is `00`, 12 PM is `12`.

- The period segment is a `spinbutton` labeled "AM/PM", `aria-valuemin` 0,
  `aria-valuemax` 1, `aria-valuetext` its label. Its text is `periodLabels`,
  `['AM', 'PM']` by default; there is no locale lookup.
- The hour segment announces 1–12.
- The period counts as a segment: the value is published only once it is set.
  An incoming value sets it from the hour.
- Typing into the hour runs 1–12: `1` waits for a second digit, `2`–`9` are
  done, and a lone `0` shows nothing until its second digit. The hour lands in
  the period shown; while the period is empty it reads as AM.
- Keys on the period: the first letter of either label (`a`, `p`) sets it and
  moves on; ArrowUp/Down, Home/End step it like any segment (up from empty is
  AM). Setting it moves the hour into its half.
- Arrows on the hour step within its period, 11 → 12 wrapping, without
  changing it.
- `TimepickerColumn unit="hour"` lists 12, 01–11 of the period shown (AM while
  empty); its options' `value` is still the hour 0–23. `unit="period"` lists
  the two labels, and renders nothing in 24-hour.
- Turning `hourCycle` on or off keeps the time.

## Min and max

`min` and `max` are times, `HH:mm` or `HH:mm:ss`, read as the value is. Either
may be left out. A `min` after `max` (a range over midnight) isn't supported
and bounds nothing. Without `seconds` they round inward to whole minutes
(`min="09:30:30"` allows `09:31` on).

- An option is disabled (`aria-disabled`, `data-disabled`) when no time inside
  the bounds has it, given the units above it as they are (any value while
  empty) and the units below it free. With `min="09:30"` and the hour at 09,
  minutes 00–29 are disabled; hour 08 is disabled whatever the minute. A
  period is above the hour. A click on a disabled option does nothing.
- Steps (arrows, PageUp/Down, Home/End, on a segment or a column) skip
  disabled values, wrapping as before, and Home/End go to the first or last
  allowed one.
- A step or a pick that leaves the time outside, because of the units below
  it, moves it onto the nearer bound: with the time at `12:10`, picking 09
  under `min="09:30"` gives `09:30`.
- A pick on an empty period chooses AM, or PM when only that half has the
  pick inside.
- Typing is kept as typed and published. While the value is outside the
  bounds the picker is invalid: `data-invalid`, and `aria-invalid` on the
  segments.

## Popup

The popup lines up with the whole picker. Presses on the picker while it is
open don't close it. Escape, an outside press, and focus leaving both the
picker and the popup close it.

- **Focus entering the segments** from outside opens it (`openOnFocus`, on by
  default), and focus stays on the segment: typing carries on and the columns
  follow. Focus moving between segments doesn't open it, nor does focus handed
  back as it closes, so after Escape it stays closed until focus leaves and
  returns, or a segment is pressed.
- **`TimepickerTrigger`** is optional: a button (`aria-haspopup="dialog"`) that
  toggles it. Opened from it, focus moves to the first column, and closing
  returns it to the trigger. With `openOnFocus` off, it is the only way in.

`TimepickerColumn unit="hour"` lists every value of its unit: 00–23 or
00–59. A column is a `listbox` with an `aria-label`, and a tab stop; its
options carry `role="option"`, `aria-selected`, `data-selected` and
`data-value`. A column for `second` renders nothing without `seconds`.

- On opening and on every change, a column scrolls its selected option to its
  middle, inside the column only, never the page.
- Scrolling a column only browses. A click on an option picks it.
- Keys on a column: ArrowUp/Down pick the previous/next, wrapping; Home/End
  the first/last (skipping what `min`/`max` rule out); ArrowLeft/Right move to the neighboring column; Enter
  closes the popup.
- Picking while the value is empty fills the other units with `00` (and an
  empty period with AM), so the value is complete at once.
- Picking never closes the popup: the user picks each unit, then leaves.

## Clear

`TimepickerClear` is shown while any segment is filled and the picker can be
changed. It empties every segment, publishes `null`, and focuses the first
segment.

## Field and form

Inside a `FieldRoot` the group is the control: labeled and described by the
field, `aria-required` and `aria-invalid` from it, and disabled, read-only,
required, invalid and name follow it. Clicking the label focuses the first
segment. The field is touched once focus leaves the picker and its popup, not
when it moves between them.

With a `name`, a hidden input submits the value as `HH:mm(:ss)`, or nothing
while empty.

## State

`data-open`, `data-disabled`, `data-readonly`, `data-required`,
`data-invalid` (set by the prop, the field, or a value outside `min`/`max`),
`data-empty` on the root, the input and the trigger; the segments and columns
carry `data-unit` too, and options `data-disabled` outside `min`/`max`.
