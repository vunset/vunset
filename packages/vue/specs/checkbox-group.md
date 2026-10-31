# CheckboxGroup

A set of `CheckboxRoot`s sharing one array value: what `CheckboxGroup` does,
and what a checkbox inside it does differently from one on its own.

## Value

- `v-model` (or `default-value`, else `[]`) is an array of the checked boxes'
  `value`s. A box is checked while the array holds its `value`.
- Toggling a box adds or removes its `value`. The array comes out in the order
  the boxes were mounted in; values with no box (set from outside) stay first,
  in their own order. Each change emits a new array, never a mutated one.
- A box inside a group takes its checked state from the group only: its own
  `v-model`, `true-value`, `false-value` and `default-checked` are ignored.
- A box without `value` (and not `parent`) warns in development and never
  joins the array.

## Shared state

- `disabled`, `read-only` and `invalid` on the group apply to every box, on top
  of each box's own. A disabled or read-only box can't be toggled, by the user
  or by the parent box.
- `name` and `form` on the group go on every box's hidden input, so each
  checked box submits `name=value`. A box's own `name` wins.
- A disabled group, or a disabled box, submits nothing for that box.

## Required: at least one

- `required` means at least one box checked. It is announced and marked, never
  enforced: no hidden input is `required`, so the browser doesn't block the
  submit, and the app checks it. (A `required-native` that has the browser
  enforce it may come later.)
- The group carries `aria-required`; the boxes don't, since no single box is
  required by it. A box's own `required` is announced on that box.

## Parent box

A `CheckboxRoot` with `parent` inside a group checks or clears the others.

- It counts every box but itself that is enabled. It's checked while all of
  them are, indeterminate while some are, unchecked while none is.
- Toggling it while it's checked clears every enabled box; otherwise it checks
  every enabled box. Disabled boxes keep their state either way.
- It has no `value`, joins no array, submits nothing, and is never required.
- It renders before the boxes it counts. Until any box has registered (always,
  on a server render), it counts the group's `allValues` instead, the enabled
  boxes' values, if given; without them it starts unchecked.

## Field

- Inside a `FieldRoot`, the group is the field's control: `role="group"`, labeled
  by the field's label (`aria-labelledby`), described by its messages,
  following its disabled, read-only, required and invalid state, and taking its
  `name`.
- The field is filled while the array is non-empty, and dirty once it differs
  from the array it started with. Focus moving into the group marks it focused;
  focus leaving the group (not moving between its boxes) marks it touched.
- A box takes no id, name, description or focus from the group's field. A
  `FieldRoot` of its own, inside the group (a box with its own label and help),
  still labels and describes it.

## Keyboard

None of its own: each box is a tab stop, toggled by Space (and Enter), as on
its own.
