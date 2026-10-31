# ToggleGroup in a form

What a `ToggleGroup` does with a form and inside a `FieldRoot`. Its keyboard and its
single/multiple rules are its own and unchanged.

## Value in a form

- `name` (or the field's) submits one hidden input per pressed toggle, its
  value as a string, in the order the value holds them. `form` goes on each.
  Nothing pressed, or no name: nothing is submitted.

## Required

- The group's own `required` keeps one toggle on, as before: the last one
  refuses to come up, and an empty uncontrolled group presses its first.
- A field's `required` is announced only: `aria-required` and `data-required` on
  the group. It presses nothing for the user; the page validates.

## Invalid

- `invalid` (or the field's) puts `aria-invalid` and `data-invalid` on the group
  and `data-invalid` on every toggle.

## Field

- Inside a `FieldRoot`, the group is the field's control: labeled by its label,
  described by its messages, disabled with it, and taking its `name`. A press on
  the label does nothing: no single toggle is the control.
- The field is filled while a toggle is pressed, dirty once the value differs
  from the one it started with, focused while focus is inside the group, and
  touched once it leaves.

## Read-only

Not offered: a pressed button has no read-only state a screen reader announces,
so a group that looked read-only would read as merely disabled or not at all.

## In a toolbar

- Inside a `Group variant="toolbar"`, the group doesn't wrap unless `loop` says
  so: the arrows past its first and last toggle belong to the toolbar.
- There, → past the last toggle (↓ when vertical) and ← past the first (↑) are
  left unhandled, so the toolbar moves on to its next or previous item. With
  `loop` set, the group keeps them and wraps, as anywhere else.
