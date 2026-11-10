# One-time code (OTP / PIN)

One field holding a short code, typed one character per box. `OtpRoot` owns the
value; each `OtpInput` is one box, placed by its `index`. The boxes are plain
siblings, so a `Group` (or ui's AppGroup) around some or all of them joins
them.

## Value

- A string of at most `length` characters, with no holes: box `i` shows
  character `i`, and boxes past the end are empty.
- `type="numeric"` (the default) takes digits, `alphanumeric` letters and
  digits; `filter` (a regex source, a RegExp or a predicate) tests one
  character and overrides `type`. Letters are kept as typed.
- Characters that don't pass are dropped, wherever they come from: typing,
  pasting, autofill.
- `complete` fires with the value when it reaches `length` through input.
- Inside a `FieldRoot` it follows the field (disabled, read-only, required,
  invalid, name) and reports filled, focused and touched; touched once focus
  leaves every box, not as it moves between them.
- With a `name`, a hidden input submits the whole code.

## Focus

- Focusing a box past the first empty one moves focus to that empty box, so
  the code is always typed from the start. A filled box can be focused.
- A focused box selects its character, so typing replaces it.
- Only the first box has `autocomplete="one-time-code"`, and inside a field it
  carries the field's control id, so its label focuses it.

## Typing

- A character typed into box `i` replaces character `i` (or is appended, at the
  end), and focus moves to box `i + 1`; in the last box it stays.
- Several characters arriving at once in box `i` (a paste, an SMS autofill)
  fill from `i` onward, cut at `length`; focus goes to the box after the last
  one written, or the last box.

## Keys

- **Backspace** in a filled box removes its character (the ones after it move
  back); in an empty box it removes the previous character and focuses it.
- **Delete** removes the focused box's character; focus stays.
- **ArrowLeft / ArrowRight** move one box, swapped in a right-to-left layout,
  never past the first empty box. **Home / End** go to the first box and the
  first empty one (or the last).
- Read-only: arrows and Home/End move; nothing edits. Disabled: no box takes
  focus.

## Assistive technology

- The root is a `role="group"`, labeled by the field's label.
- Each box has an `aria-label` from `getInputLabel(index, length)`,
  `Character 1 of 6` by default.
- `mask` renders the boxes as `type="password"`.
