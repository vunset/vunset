# AppDrawer

A panel that slides in from an edge of the screen and can be swiped back out.
Its title, body and footer work like [AppDialog](/ui/app-dialog)'s. Built on
[Drawer](/overlays/drawer).

::: preview ui/app-drawer/Basic
:::

## Usage

```vue
<script setup lang="ts">
import { AppDrawer, AppButton } from '@vunset/ui';
</script>

<template>
  <AppDrawer title="Filters" trigger="Filters" :as="AppButton" variant="outline"> … </AppDrawer>
</template>
```

The trigger works as on [AppDialog](/ui/app-dialog#usage): `trigger` is its
text, `as` renders it as an [AppButton](/ui/app-button) or anything else, and
attributes that aren't the drawer's props go to it. To open the drawer from
somewhere else, leave out the trigger and use `v-model:open`.

The body and footer slots get a `close()` function. The body scrolls when it's
taller than the screen. There's no close button unless you add `closable`,
labeled by `close-label`. Without a title or description it sits in the
corner.

`@closed` fires once the drawer has closed and slid out. That's the moment to
unmount a drawer you only mount while it's shown, as in
[AppDialog](/ui/app-dialog#mounted-to-be-shown).

## Examples

### Sides

`side` is `bottom` (the default), `top`, `right` or `left`.

::: preview ui/app-drawer/Sides
:::

### Swipe to close

A drawer only closes on a swipe if you ask for it.

- `handle` draws a handle on its inner edge. Swipe the handle away to close.
- `swipeable` lets you swipe from anywhere on the panel. Scrolling in the
  other direction still works.

Use both together: the handle shows the drawer can be swiped, and the whole
panel responds.

::: preview ui/app-drawer/Swipe
:::

## Keyboard

| Key            | Does                                           |
| -------------- | ---------------------------------------------- |
| <kbd>Tab</kbd> | Moves through the drawer only, while it's open |
| <kbd>Esc</kbd> | Closes it                                      |

Clicking outside it closes it too, unless you pass `:outside-press="false"`.
That's unlike AppDialog, which ignores clicks outside.

## Styling

| Class                     | On                                                                    |
| ------------------------- | --------------------------------------------------------------------- |
| `app-drawer`              | The panel, with `data-side`, and `data-dragging` while swiped         |
| `app-drawer-handle`       | The handle, with `handle`                                             |
| `app-drawer-content`      | Everything inside the panel but the handle                            |
| `app-drawer-body`         | The body, which scrolls                                               |
| `app-drawer-trigger`      | The default trigger, given no `as`: an underlined text button         |
| `app-backdrop`            | The dimmed page behind                                                |
| `app-surface`             | The panel's look, shared by `AppDialog`, `AppDrawer` and `AppPopover` |
| `app-overlay-header`      | The title and description                                             |
| `app-overlay-title`       | The title                                                             |
| `app-overlay-description` | The description                                                       |
| `app-drawer-footer`       | The footer's buttons, at its end                                      |
| `app-overlay-close`       | The close button, with `closable`                                     |

For classes on the inner parts, use `trigger-class`, `popup-class`,
`backdrop-class`, `header-class`, `title-class`, `description-class`,
`body-class` and `footer-class`. See
[classes on the inner parts](/ui/theming#classes-on-the-inner-parts). To fit
your own layers above or below it, see [stacking](/ui/theming#stacking).

<<< ../../packages/ui/src/app/app-drawer.css

## API Reference

### AppDrawer

::: api app/AppDrawer
:::
