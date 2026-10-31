# Dialog and Drawer: closed

When a dialog (or drawer, which is one) has finished closing, so an app can
unmount a dialog it mounted only to show it.

- `closed` fires when the popup leaves the DOM: after `open` has turned false
  and its exit animation, if any, has finished. Not on `update:open`.
- By then focus has gone back to what it was on before the dialog opened, while
  that element is still in the page.
- Once per close. A dialog that never opened never fires it; one that reopens
  before its exit has finished doesn't either, since it never left the DOM.
- So the pattern: the app mounts the dialog with `default-open` behind a
  `v-if`, and clears that flag on `closed`. Unmounting on `update:open` instead
  cuts the exit animation and, the focus trap going with it, leaves focus on
  the body.

## Mounted already open

- A dialog that mounts open (`default-open` behind a `v-if`) animates in as one
  opened by its trigger does, and makes the page behind inert once it is in the
  page.
- The exit waits for the popup's animations and its children's, except looping
  ones: a spinner inside (a button left loading) never finishes, and must not
  keep the dialog, its scroll lock and its inert page around.
