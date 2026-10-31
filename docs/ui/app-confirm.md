# AppConfirm

Asks before an action goes through: a small panel by its trigger, with a
title, a message and two buttons. Built on [Popover](/overlays/popover), as
an `alertdialog`.

::: preview ui/app-confirm/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppConfirm, AppButton } from '@vunset/ui';
</script>

<template>
  <AppConfirm title="Delete endpoint?" message="It can’t be undone." confirm-text="Delete" @confirm="remove">
    <AppButton tone="danger">Delete</AppButton>
  </AppConfirm>
</template>
```

Put the button that asks for confirmation in the default slot. It becomes the
trigger as it is, with nothing wrapped around it, so keep it a button.

`confirm` fires when the user confirms. `cancel` fires on the cancel button,
<kbd>Esc</kbd>, or a click outside.

`message` is the text under the title, and line breaks in it show. (`content`
is another name for it.) The `#message` slot takes markup instead. The confirm
button is red (`tone="danger"`) unless you pass another `tone`.

## Examples

### Another tone, below its trigger

`tone` changes the confirm button's color, and `side` where the panel opens.

::: preview ui/app-confirm/Tone
:::

### In every row

`lazy` draws only the button until a pointer reaches it or it's pressed, as
[AppPopover's](/ui/app-popover#in-every-row) does, for a table with a delete
button in each row.

```vue
<AppConfirm lazy title="Delete endpoint?" confirm-text="Delete" @confirm="remove(row)">
  <AppButton variant="outline" size="sm" title="Delete" square>…</AppButton>
</AppConfirm>
```

## Keyboard

| Key | Does |
| --- | --- |
| <kbd>Esc</kbd> | Cancels, and focus goes back to the trigger |

When it opens, focus goes to the cancel button, so a stray <kbd>Enter</kbd>
doesn't confirm anything.

## Styling

| Class | On |
| --- | --- |
| `app-confirm` | The panel, beside `app-surface` and `app-popover`, with `data-side` and `data-align` |
| `app-confirm-header` | The icon and the title |
| `app-confirm-icon` | The icon |
| `app-confirm-title` | The title |
| `app-confirm-message` | The message |
| `app-confirm-actions` | The two buttons |
| `app-confirm-cancel`, `app-confirm-confirm` | Each button, an [AppButton](/ui/app-button) |

`popup-class` adds classes to the panel. See
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts).

<<< ../../packages/ui/src/app/app-confirm.css

## API Reference

### AppConfirm

::: api app/AppConfirm
:::
