# Number field

A text input for a number, with buttons and keys that step it. `NumberFieldRoot`
owns the value; `NumberFieldInput` is the input, `NumberFieldIncrement` and
`NumberFieldDecrement` the buttons.

## Value

- A `number`, or `null` when empty. `v-model` writes as the text is typed,
  whenever it reads as a number; empty text writes `null`.
- The text is shown formatted with `format` (`Intl.NumberFormatOptions`) and
  `locale`, and reformatted on commit: blur, or Enter.
- Commit clamps to `min` and `max`. Text that doesn't read as a number goes
  back to the value's formatted text.
- Reading text: the locale's grouping separators, currency and unit symbols and
  spaces are ignored; its decimal separator is the point, and so is `.` when
  `.` isn't its grouping separator; its minus sign or `-` is the sign. Percent
  formats divide by 100.
- While typing, an insertion is refused when the text it makes couldn't be on
  its way to a number: only digits, separators, signs and the format's own
  symbols get in. A minus can't be typed when `min` is zero or more.
- Inside a `FieldRoot` it follows the field and reports filled, focused and
  touched. The input shows formatted text, so a hidden input submits the raw
  number when there's a `name`.

## Stepping

- `step` (1) moves the value; `largeStep` (10) with Shift, PageUp and PageDown.
- A step lands on the grid of `step` counted from `min` (or 0): 1.5 stepped up
  by 1 from a min of 0 is 2, not 2.5. The result is rounded to the step's
  decimals, so 0.1 + 0.2 is 0.3.
- From `null`, a step up gives `min` if set, else `0`; a step down `max` if
  set, else `0`; either clamped to the range.
- Every step is clamped to `min`/`max`, and commits (formatted text).
- **ArrowUp / ArrowDown** step; **Home / End** go to `min` / `max` when set.
- `wheel` lets the wheel step it while the input has focus.

## Buttons

- Pressing one steps once at once, then repeats after 400 ms every 60 ms until
  the pointer is released, leaves or is cancelled.
- They are `type="button"`, out of the tab order (the input's arrows do the
  same), and keep focus on the input.
- A button is disabled at its end of the range, and with the field disabled or
  read-only.
- `aria-label`s default to `Increase` and `Decrease`.

## Assistive technology

- The input is `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`,
  `aria-valuemax` and `aria-valuetext` (the formatted value). `inputmode` is
  `numeric` when `format` allows no fraction digits and `min` is zero or more,
  else `decimal`.
