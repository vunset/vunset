# AppDialog

A modal window over a dimmed page, with a title, a description, a body and a
footer of actions. Built on [Dialog](/overlays/dialog).

::: preview ui/app-dialog/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppDialog, AppButton } from '@vunset/ui';
</script>

<template>
  <AppDialog title="Delete project?" trigger="Delete" :as="AppButton" tone="danger">
    <p>It can’t be undone.</p>

    <template #footer="{ close }">
      <AppButton variant="outline" @click="close">Cancel</AppButton>
      <AppButton variant="solid" tone="danger" @click="close">Delete</AppButton>
    </template>
  </AppDialog>
</template>
```

`trigger` is the text of the button that opens it, and the `#trigger` slot
takes markup instead. Without `as`, that button is an underlined text button.
Pass `as` to render something else, usually an [AppButton](/ui/app-button).
Any attribute that isn't one of the dialog's props (`variant`, `aria-label`,
`class`) goes to the trigger. Keep it a button, because only buttons respond
to Enter and Space. To open the dialog from somewhere else, leave out the
trigger and use `v-model:open`.

`title` and `description` are the dialog's heading and text, and screen
readers announce them too. The `#title` and `#description` slots take markup
instead. The body and footer slots get a `close()` function.

## Examples

### Controlled

With `v-model:open` you decide when it opens, from any button or none.
`size` is `sm`, `md` (the default) or `lg`. `:closable="false"` removes the
close button. Use `role="alertdialog"` for a question that must be answered.

::: preview ui/app-dialog/Controlled
:::

### A form

The body and the footer are separate slots, so a `<form>` in the body can't
wrap the footer's buttons. It doesn't need to: a button's `form` attribute
links it to a form anywhere on the page. Give the form an id (`useId()`) and
point the footer's `type="submit"` button at it. Now the button submits the
form, just like Enter in one of its fields. Call `close()` from the body's slot
in `@submit` once the save succeeds, so the dialog stays open on an error.

::: preview ui/app-dialog/Form
:::

### A layout of your own

Leave out `title`, `description` and `#footer`, and the default slot fills
the whole panel, so a `<form>` can wrap everything. The close button moves
to the corner. You can still use the `app-overlay-header`,
`app-overlay-title` and `app-overlay-footer` classes on your own header and
footer, and a `DialogTitle` from `@vunset/vue` still names the dialog for
screen readers.

::: preview ui/app-dialog/OwnLayout
:::

### Mounted to be shown

A dialog with its own logic, like a form or a request, is easier to keep in
its own component that mounts only while it's shown, so it starts fresh every
time. Inside it, `default-open` opens the dialog as it mounts. Outside it, a
`v-if` mounts it and `@closed` unmounts it.

`closed` fires after the exit animation finishes and focus is back on the
button that opened it. If you unmount on `update:open` instead, you cut the
animation short and focus gets lost.

::: preview ui/app-dialog/MountOnOpen
:::

## Keyboard

| Key            | Does                                                                |
| -------------- | ------------------------------------------------------------------- |
| <kbd>Tab</kbd> | Moves through the dialog only; focus can't leave it while it's open |
| <kbd>Esc</kbd> | Closes it, unless `:escape-key="false"`                             |

On opening, focus moves to the first control inside; on closing, back to what
opened it.

## Styling

| Class                     | On                                                                    |
| ------------------------- | --------------------------------------------------------------------- |
| `app-dialog`              | The panel, centered, with `data-size`                                  |
| `app-dialog-trigger`      | The default trigger, given no `as`: an underlined text button         |
| `app-backdrop`            | The dimmed page behind                                                |
| `app-surface`             | The panel's look, shared by `AppDialog`, `AppDrawer` and `AppPopover` |
| `app-overlay-header`      | The title and description                                             |
| `app-overlay-title`       | The title                                                             |
| `app-overlay-description` | The description                                                       |
| `app-overlay-footer`      | The footer's buttons, at its end                                      |
| `app-overlay-close`       | The close button, in the header                                       |

For classes on the inner parts, use `trigger-class`, `popup-class`,
`backdrop-class`, `header-class`, `title-class`, `description-class` and
`footer-class`. See [classes on the inner parts](/ui/theming#classes-on-the-inner-parts).
The `#close` slot replaces the close button's icon.

The width is `--app-dialog-width`, set by `data-size`. To fit your own
layers above or below it, see [stacking](/ui/theming#stacking).

<<< ../../packages/ui/src/app/app-dialog.css

<<< ../../packages/ui/src/app/app-overlay.css

## API Reference

### AppDialog

::: api app/AppDialog
:::
