# Calendar in a form, and Datepicker

What a `CalendarRoot` does inside a `FieldRoot` and a form, and what a
`DatepickerRoot` adds: a trigger that shows the value, opening a popup with the
calendar in it.

## Calendar: value in a form

- `name` (or the field's) submits the selection as hidden inputs, one per day,
  each `YYYY-MM-DD` for the local day: one for `single`, the start and end for a
  complete `range` (none while only one end is picked), one per day for
  `multiple`, in date order. `form` goes on each.
- Without a name, nothing is submitted.

## Calendar: field

- Inside a `FieldRoot`, the calendar follows its disabled, read-only, required and
  invalid state, on top of its own `disabled`, `read-only`, `required` and
  `invalid`, and takes its `name`.
- `required` and `invalid` are state, as on Select: `aria-required`,
  `aria-invalid`, `data-required`, `data-invalid`. A required calendar does not
  block a native submit; validation is the page's (or `useValidate`'s).
- The root is `role="group"`, labeled by the field's label and described by its
  messages. A press on the label does nothing: the label is not a control's.
- The field is filled while a day is selected (a range: once one end is), dirty
  once the value differs from the one it started with, focused while focus is
  inside the root, and touched once focus leaves it.

## Datepicker: parts

- `DatepickerRoot` holds the value and every calendar option (it is the
  calendar), plus the popup's open state and placement. Calendar parts inside
  it (`CalendarGrid`, `CalendarDay`, `CalendarPrev` …) work as in a
  `CalendarRoot`. It renders an element, carrying the calendar's `data-*` state
  and `data-open`, and the hidden inputs.
- `DatepickerTrigger` is a button that opens and closes the popup.
- `DatepickerValue` shows the value as text, or the placeholder.
- `DatepickerClear` empties the value.
- The popup is the shared `Portal` / `Positioner` / `Popup`, `role="dialog"`.

## Datepicker: the text

`DatepickerValue` writes the value in the root's `locale`:

- `single`: the day, e.g. `Oct 3, 2026`.
- `range`: both ends, `Oct 3 – Oct 9, 2026`; the year is written once when the
  ends share it, on both when they don't. One end alone: that day, then ` – `.
- `multiple`: one or two days joined by `, `; more: `N days`.
- Nothing selected: the `placeholder`, and the element carries
  `data-placeholder`.

Its slot receives the dates and the text, to write it another way.

## Datepicker: open and close

- A press on the trigger focuses it and opens the popup, or closes it. Escape, a press outside,
  and Tab out of the popup close it; focus goes back to the trigger.
- On opening, focus moves to the calendar's current day: the selected day, else
  today (within bounds), as Tab would reach it in the grid.
- `close-on-select` (default: on for `single` and `range`, off for `multiple`)
  closes once the pick is complete: a day for `single`, the second end for
  `range`. A preset that sets a complete value closes it too.
- Closing with only one end of a range picked completes the range onto that
  day.
- Disabled or read-only, the trigger doesn't open it.

## Datepicker: field

- Inside a `FieldRoot`, the trigger is the field's control: it takes the field's
  id, so the label's `for` points at it, and a press on the label is a press on
  the trigger, as for any button: it opens the popup;
  `aria-labelledby` names it by the label and then its own text (the value);
  it's described by the field's messages and carries `aria-required` and
  `aria-invalid`.
- Focus and touched follow the trigger and the popup together: focused while
  focus is in either, touched once it has left both.
- Values, filled and dirty are the calendar's, as above.

## Datepicker: v-model modifiers

- `v-model.iso` writes each day as `YYYY-MM-DD` for the local day: a string for
  `single`, a list of strings for `range` and `multiple`, `null` or `[]` when
  empty.
- `v-model.iso.safe` does the same, except that today, picked while the local
  day has begun and the UTC day hasn't (east of Greenwich, just after
  midnight), is written as yesterday. The value read back is that day.
- `.safe` alone writes dates, with the same step back.
- The model reads either shape back; hidden inputs are always the plain
  `YYYY-MM-DD` of the picked days.

## Datepicker: max-today

- `max-today` rules out every day after today, as `max` set to today would.
  Given both, the earlier of the two wins.

## Datepicker: presets

- `presets` is a list (built-in keys or `{ key, label, range }`), or a group:
  `base` is `today`, `yesterday`, `last-7`, `last-30`, `this-month`,
  `last-month`; `all` adds `this-year`, `q1`–`q4`. Without it, `base`. A list
  may hold the groups among its entries; a key that comes up twice is offered
  once, where it first appears.
- A preset is disabled when its days fall wholly outside `min`/`max`, and a
  built-in quarter while its first day is still ahead. A custom range is never
  disabled for lying in the future.
- `preset` names a preset (one from `presets`, or any built-in key) whose days
  are the starting value, shaped by `mode` as a press on it would be: its first
  day for `single`, both ends for `range`, every enabled day for `multiple`.
  - Uncontrolled, it is the default value; nothing is emitted. `default-value`
    wins when given.
  - With a `v-model` that starts empty (`null`, `[]`), it is written to the
    model once, while the datepicker sets up, through the modifiers. A model
    that already holds a value is left alone.
  - A preset that falls wholly outside `min`/`max` leaves the value empty.

## DatepickerClear

- Present only while there's a value and the datepicker is neither disabled nor
  read-only. A press empties the value, keeps the popup as it was, and moves
  focus to the trigger.
- `aria-label="Clear"` unless it has text of its own.
