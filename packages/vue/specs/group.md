# Group — toolbar keyboard

What `Group variant="toolbar"` does with the keyboard. A plain `Group`
(`variant="group"`) does none of it.

## Items

- The toolbar's items are the focusable elements inside it (buttons, links,
  form fields, anything with a `tabindex`), in document order, minus disabled
  ones (`disabled` or `aria-disabled="true"`).
- Found in the DOM when needed, so any control counts: a native `<button>`, a
  `Button`, a menu trigger, an input.
- A set that moves focus on its own is one item: the member it currently
  leaves in the tab order. Its arrows are its own, and the toolbar never sets a
  `tabindex` inside it. That is an element inside the toolbar with `role`
  `radiogroup`, `tablist`, `listbox`, `menubar` or `toolbar`, or a `group` that
  holds a control with `tabindex="-1"` the toolbar didn't set (a `ToggleGroup`).
  A plain `Group` inside, clustering buttons, is not one: its buttons are items.
- A `ToggleGroup` inside doesn't wrap by default and leaves the arrows past its
  ends to the toolbar, so they carry on to the next item (`specs/toggle-group.md`).

## Tab stop

- One item outside nested sets is in the tab order (`tabindex="0"`), the rest
  `tabindex="-1"`: at first the first item, then whichever item last had focus.
- Focus landing in a nested set takes the toolbar's own tab stop away, so Tab
  reaches the toolbar once. A nested set keeps its own stop, so while focus is
  on a plain item the toolbar can have two.
- An item added, removed, enabled or disabled is picked up; if the stop's item
  goes, the first item takes it.
- Switching back to `variant="group"`, or unmounting, puts back every
  `tabindex` the toolbar changed.

## Keys

On the toolbar, unless a handler inside already called `preventDefault()`:

| Key | Does |
| --- | --- |
| → / ← (horizontal), ↓ / ↑ (vertical) | Next or previous item, wrapping at the ends |
| Home / End | First or last item |

Each moves focus and prevents the default. In a text field (an `<input>` that
takes text, a `<textarea>`, `contenteditable`) the keys move the caret instead:
only → at the end of a single-line field, or ← at its start, with nothing
selected, carries on to the next or previous item, so a field never traps focus.
Home and End stay in the field.
