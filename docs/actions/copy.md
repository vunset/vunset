# Copy

A button that copies text to the clipboard and shows it worked for a moment.
Its icon switches from "copy" to "copied", and back once `timeout` has passed.
Both icons are built in so it works out of the box; [replace them](#icons)
with your own.

::: preview copy/Basic
:::

## Anatomy

```vue
<script setup lang="ts">
import { Copy } from '@vunset/vue';
</script>

<template>
  <Copy value="…" />
</template>
```

Give it the text to copy as `value`. With no `label` and no content of its
own, the button is labeled "Copy" for screen readers.

A click stops at the button, so a copy button inside a clickable row or card
doesn't also fire the row's click.

To style the copied state, use `data-copied` on the button. Both icons are
always rendered, each with `data-active` while it's the one in use, so you
can stack them and cross-fade between them.

## Examples

### With a label

`label`, or content of your own, goes beside the icon. The slot gets `copied`,
so its text can change too. `@copy` tells you after each press whether the
text reached the clipboard.

::: preview copy/Label
:::

### Icons

`icon` and `copied-icon` pick icons by name, the same way [Icon](/utilities/icon)
does. If your icon folder has icons named `copy` and `copied`, they replace
the built-in ones everywhere. To draw something else entirely, use the
`#icon` slot.

::: preview copy/Icons
:::

### Without the button

`useClipboard` gives you the same behavior without the button: call
`copy(text)` from your own. One instance can serve a whole list. Pass an id
with each copy, and `copiedId` tells you which row was copied.

::: preview copy/Composable
:::

## API Reference

### Copy

The button carries `data-part="copy"` and `data-status` (`idle`, `copied` or
`error`), plus `data-copied` right after a copy and `data-disabled` while
disabled. Inside, the icons sit in a `data-part="copy-icons"` wrapper, each a
`data-part="copy-icon"` with `data-state="idle"` or `"copied"`, and
`data-active` on the one in use.

::: api copy/Copy
:::

### useClipboard

`useClipboard({ timeout? })`. `timeout` is how long, in milliseconds,
`copied` or `error` stays before going back to `idle`. It's 1500 by default.

| Member | Type |
| --- | --- |
| `copy` | `(text: string, id?: string \| number) => Promise<boolean>`<div>Copies the text, and resolves with whether it worked. Empty text copies nothing.</div> |
| `status` | `Readonly<Ref<'idle' \| 'copied' \| 'error'>>`<div>`copied` or `error` for a moment after a copy.</div> |
| `copied` | `ComputedRef<boolean>`<div>Whether `status` is `copied`.</div> |
| `copiedId` | `Readonly<Ref<string \| number \| null>>`<div>The id passed with the last copy that worked.</div> |
| `error` | `Readonly<Ref<unknown>>`<div>Why the last copy failed: outside a secure context, or refused by the browser.</div> |
| `reset` | `() => void`<div>Settles back to `idle` at once.</div> |
